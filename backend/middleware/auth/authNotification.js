const Notification = require('../../models/NotificationModel');

// Check if the logged-in user owns the notification
const checkNotificationOwnership = async (req, res, next) => {
    try {
        const userId = req.userId;        // set by requireAuth
        const userRole = req.userRole;    // set by requireAuth

        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        const isOwner = notification.userId.toString() === userId.toString();
        const isAdmin = userRole === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                error: 'Forbidden: You do not have permission to modify this notification'
            });
        }

        req.notification = notification;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { checkNotificationOwnership };