const Notification = require('../models/NotificationModel');

// get all notifications
const getAllNotifications = async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { userId } : {};
        const notifications = await Notification.find(filter).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// manually trigger expiry check
const triggerExpiryCheck = async (req, res) => {
    try {
        const { processExpiredHazards } = require('../jobs/hazardExpiryJob');
        await processExpiredHazards();
        res.status(200).json({ message: 'Expiry check triggered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// update notification
const updateNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.status(200).json(notification);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// delete notification
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllNotifications,
    triggerExpiryCheck,
    updateNotification,
    deleteNotification
};