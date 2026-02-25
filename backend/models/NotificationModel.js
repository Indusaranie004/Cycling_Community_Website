const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    interactionId: {
        type: String,
        required: true
    },
    fcmToken: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Hazard Expired'
    },
    body: {
        type: String
    },
    status: {
        type: String,
        enum: ['sent', 'failed'],
        default: 'sent'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);