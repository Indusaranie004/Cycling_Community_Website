const mongoose = require('mongoose');

const communityChallengeSchema = new mongoose.Schema({
    challengeId: {
        type: String,
        default: () => `CHL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
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
    targetDistance: {
        type: Number,
        required: true,
        min: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming'
    }
}, {
    timestamps: true
});

// Check if challenge has ended
communityChallengeSchema.methods.hasEnded = function() {
    return new Date() > this.endDate;
};

module.exports = mongoose.model('CommunityChallenge', communityChallengeSchema);