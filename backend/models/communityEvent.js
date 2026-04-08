const mongoose = require('mongoose');

const communityEventSchema = new mongoose.Schema({
    eventId: {
        type: String,
        default: () => `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    eventTime: {
        type: String,
        required: true
    },
    maxParticipants: {
        type: Number,
        required: true,
        min: 1
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    }
}, {
    timestamps: true
});

// Check if event is full
communityEventSchema.methods.isFull = function() {
    return this.currentParticipants >= this.maxParticipants;
};

module.exports = mongoose.model('CommunityEvent', communityEventSchema);