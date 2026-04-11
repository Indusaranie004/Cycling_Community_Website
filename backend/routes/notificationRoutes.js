const express = require('express');
const router = express.Router();
const {
    getAllNotifications,
    triggerExpiryCheck,
    updateNotification,
    deleteNotification
} = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth/authRoute');
const { checkNotificationOwnership } = require('../middleware/auth/authNotification');
const {
    validateNotificationQuery,
    validateNotificationId,
    validateUpdateNotification
} = require('../middleware/validation/validateNotification');
const User = require('../models/User'); 

// GET all
router.get('/', requireAuth, validateNotificationQuery, getAllNotifications);

// POST trigger expiry check
router.post('/trigger-expiry-check', requireAuth, triggerExpiryCheck);

// PUT update
router.put('/:id', requireAuth, validateNotificationId, validateUpdateNotification, checkNotificationOwnership, updateNotification);

// DELETE
router.delete('/:id', requireAuth, validateNotificationId, checkNotificationOwnership, deleteNotification);

// Example Backend Route
router.patch('/update-fcm', requireAuth, async (req, res) => {
    try {
        const { fcmToken } = req.body;
        // userId comes from requireAuth middleware
        await User.findByIdAndUpdate(req.userId, { fcmToken }, { returnDocument: 'after' });
        res.status(200).json({ message: "Token updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;