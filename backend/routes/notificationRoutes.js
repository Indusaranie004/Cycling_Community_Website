const express = require('express');
const router = express.Router();
const {
    getAllNotifications,
    triggerExpiryCheck,
    updateNotification,
    deleteNotification
} = require('../controllers/notificationController');

router.get('/', getAllNotifications);
router.post('/trigger-expiry-check', triggerExpiryCheck);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);

module.exports = router;