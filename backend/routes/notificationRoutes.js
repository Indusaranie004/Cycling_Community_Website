const express = require('express');
const router = express.Router();
const Notification = require('../models/NotificationModel');

// GET all notifications
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { userId } : {};
        const notifications = await Notification.find(filter).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST manually trigger expiry check (useful for Postman testing)
router.post('/trigger-expiry-check', async (req, res) => {
    try {
        const { processExpiredHazards } = require('../jobs/hazardExpiryJob');
        await processExpiredHazards();
        res.status(200).json({ message: 'Expiry check triggered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;