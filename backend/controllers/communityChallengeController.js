const CommunityChallenge = require('../models/communityChallenge');
const CommunityParticipant = require('../models/communityParticipant');

// GET all community challenges
const getAllCommunityChallenges = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        
        const communityChallenges = await CommunityChallenge.find(filter).sort({ startDate: 1 });
        res.status(200).json(communityChallenges);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET single community challenge by ID
const getCommunityChallengeById = async (req, res) => {
    try {
        const communityChallenge = await CommunityChallenge.findOne({ challengeId: req.params.id });
        
        if (!communityChallenge) {
            return res.status(404).json({ error: 'Community challenge not found' });
        }
        
        res.status(200).json(communityChallenge);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE community challenge
const createCommunityChallenge = async (req, res) => {
    try {
        const { userId, title, description, targetDistance, startDate, endDate } = req.body;

        if (!userId || !title || !targetDistance || !startDate || !endDate) {
            return res.status(400).json({ error: 'All required fields must be provided' });
        }

        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        const communityChallenge = await CommunityChallenge.create({
            userId, title, description, targetDistance, startDate, endDate
        });

        res.status(201).json(communityChallenge);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// JOIN community challenge
const joinCommunityChallenge = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const communityChallenge = await CommunityChallenge.findOne({ challengeId: req.params.id });
        
        if (!communityChallenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Check if already joined
        const existingParticipant = await CommunityParticipant.findOne({
            userId,
            challengeId: communityChallenge.challengeId
        });

        if (existingParticipant) {
            return res.status(400).json({ error: 'Already joined this challenge' });
        }

        // Create participant record
        await CommunityParticipant.create({
            userId,
            challengeId: communityChallenge.challengeId,
            progress: 0,
            status: 'joined',
            joinedAt: new Date()
        });

        res.status(200).json({ 
            message: 'Successfully joined challenge', 
            communityChallenge 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE progress - User logs cycling activity
const updateCommunityChallengeProgress = async (req, res) => {
    try {
        const { userId, distance } = req.body;
        
        if (!userId || distance === undefined) {
            return res.status(400).json({ error: 'userId and distance are required' });
        }

        const communityChallenge = await CommunityChallenge.findOne({ challengeId: req.params.id });
        
        if (!communityChallenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Find participant record
        const participant = await CommunityParticipant.findOne({
            userId,
            challengeId: communityChallenge.challengeId,
            status: 'joined'
        });

        if (!participant) {
            return res.status(404).json({ error: 'Not a participant of this challenge' });
        }

        // Update progress in participant table
        participant.progress += distance;
        await participant.save();

        res.status(200).json({ 
            message: 'Progress updated successfully', 
            progress: participant.progress 
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET leaderboard for community challenge
const getCommunityChallengeLeaderboard = async (req, res) => {
    try {
        const communityChallenge = await CommunityChallenge.findOne({ challengeId: req.params.id });
        
        if (!communityChallenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Get participants from participant table
        const participants = await CommunityParticipant.find({
            challengeId: communityChallenge.challengeId,
            status: 'joined'
        }).sort({ progress: -1 });

        const leaderboard = participants.map((p, index) => ({
            rank: index + 1,
            userId: p.userId,
            progress: p.progress,
            joinedAt: p.joinedAt
        }));

        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET user's participation history
const getUserParticipationHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        const participations = await CommunityParticipant.find({ userId })
            .sort({ joinedAt: -1 });

        res.status(200).json(participations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Check if challenge ended and calculate winner
const checkChallengeEnded = async (req, res) => {
    try {
        const communityChallenge = await CommunityChallenge.findOne({ challengeId: req.params.id });
        
        if (!communityChallenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        if (!communityChallenge.hasEnded()) {
            return res.status(200).json({ 
                message: 'Challenge is still active',
                ended: false
            });
        }

        // Get winner from participant table
        const participants = await CommunityParticipant.find({
            challengeId: communityChallenge.challengeId,
            status: 'joined'
        }).sort({ progress: -1 });

        const winner = participants.length > 0 ? participants[0] : null;

        // Update challenge status
        communityChallenge.status = 'completed';
        await communityChallenge.save();

        res.status(200).json({ 
            message: 'Challenge ended',
            ended: true,
            winner: winner ? {
                userId: winner.userId,
                progress: winner.progress
            } : null,
            communityChallenge
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllCommunityChallenges,
    getCommunityChallengeById,
    createCommunityChallenge,
    joinCommunityChallenge,
    updateCommunityChallengeProgress,
    getCommunityChallengeLeaderboard,
    getUserParticipationHistory,
    checkChallengeEnded
};