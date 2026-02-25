const cron = require('node-cron');
const Interaction = require('../models/InteractionModel');
const Notification = require('../models/NotificationModel');
const admin = require('../config/firebase');

const processExpiredHazards = async () => {
    try {
        const now = new Date();

        // Find all active hazards that have passed their expiry time
        const expiredHazards = await Interaction.find({
            intType: 'hazard',
            isActive: true,
            expiryTime: { $lte: now }
        });

        if (expiredHazards.length === 0) return;

        console.log(`[HazardExpiryJob] Found ${expiredHazards.length} expired hazard(s)`);

        for (const hazard of expiredHazards) {
            // 1. Deactivate the hazard
            hazard.isActive = false;
            await hazard.save();

            // 2. Skip FCM if no token stored
            if (!hazard.fcmToken) {
                console.warn(`[HazardExpiryJob] No FCM token for hazard ${hazard._id}, skipping notification`);
                continue;
            }

            const title = 'Hazard Report Expired';
            const body = hazard.intDescription
                ? `Your hazard report "${hazard.intDescription}" has expired and is now inactive.`
                : 'One of your hazard reports has expired and is now inactive.';

            // 3. Send FCM notification
            let notificationStatus = 'sent';
            try {
                await admin.messaging().send({
                    token: hazard.fcmToken,
                    notification: { title, body },
                    data: {
                        interactionId: hazard._id.toString(),
                        type: 'hazard_expired'
                    }
                });
                console.log(`[HazardExpiryJob] Notification sent for hazard ${hazard._id}`);
            } catch (fcmErr) {
                console.error(`[HazardExpiryJob] FCM failed for hazard ${hazard._id}:`, fcmErr.message);
                notificationStatus = 'failed';
            }

            // 4. Store notification record regardless of FCM success/failure
            await Notification.create({
                userId: hazard.userId,
                interactionId: hazard._id.toString(),
                fcmToken: hazard.fcmToken,
                title,
                body,
                status: notificationStatus
            });
        }
    } catch (err) {
        console.error('[HazardExpiryJob] Error:', err.message);
    }
};

const startHazardExpiryJob = () => {
    // Runs every minute
    cron.schedule('* * * * *', processExpiredHazards);
    console.log('✅ Hazard expiry job scheduled');
};

module.exports = { startHazardExpiryJob, processExpiredHazards };