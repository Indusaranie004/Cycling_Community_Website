const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    interactionId: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString(),
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    routeId: {
        type: String
    },
    intLatitude: {
        type: Number
    },
    intLongitude: {
        type: Number
    },
    intType: {
        type: String,
        required: true,
        enum: ["hazard", "feedback"]
    },
    intDescription: {
        type: String
    },
    intRating: {
        type: Number,
        min: 1,
        max: 5
    },
    severityLevel: {
        type: String,
        enum: ["low", "medium", "high"]
    },
    intImgUrl: {
        type: String
    },
    expiryTime: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    fcmToken: {
        type: String
},
}, {
    timestamps: true
});

module.exports = mongoose.model('Interaction', interactionSchema);