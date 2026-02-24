const mongoose = require('mongoose');

const communityParticipantSchema = new mongoose.Schema({
    participantId: {
        type: String,
        default: () => `PART-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    eventId: {
        type: String,
        default: null
    },
    challengeId: {
        type: String,
        default: null
    },
    progress: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['joined', 'completed', 'withdrawn', 'cancelled'],
        default: 'joined'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure participant is linked to either event OR challenge
communityParticipantSchema.pre('save', function(next) {
    if (!this.eventId && !this.challengeId) {
        return next(new Error('Participant must be associated with either an event or a challenge'));
    }
    
    if (this.eventId && this.challengeId) {
        return next(new Error('Participant cannot be associated with both event and challenge'));
    }
    
    next();
});

// Indexes for faster queries
communityParticipantSchema.index({ userId: 1, status: 1 });
communityParticipantSchema.index({ eventId: 1, status: 1 });
communityParticipantSchema.index({ challengeId: 1, progress: -1 });

module.exports = mongoose.model('CommunityParticipant', communityParticipantSchema);