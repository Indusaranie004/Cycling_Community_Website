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

// CREATE community challenge (ADMIN only)
const createCommunityChallenge = async (req, res) => {
    try {
        const userId = req.userId; // From JWT
        const userRole = req.userRole; // From JWT

        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create challenges' });
        }

        const { title, description, targetDistance, startDate, endDate } = req.body;

        if (!title || !targetDistance || !startDate || !endDate) {
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

// JOIN community challenge (Authenticated users only)
const joinCommunityChallenge = async (req, res) => {
    try {
        const userId = req.userId; // From JWT
        const userRole = req.userRole;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Prevent admins from joining challenges
        if (userRole === 'admin') {
            return res.status(403).json({ error: 'Admins cannot join challenges. Only regular users can participate.' });
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

// UPDATE progress - User logs cycling activity (Authenticated users only)
const updateCommunityChallengeProgress = async (req, res) => {
    try {
        const userId = req.userId; // From JWT
        const userRole = req.userRole;
        const { distance } = req.body;

        // Prevent admins from updating progress
        if (userRole === 'admin') {
            return res.status(403).json({ error: 'Admins cannot update progress. Only regular users can log rides.' });
        }

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


// GET participants for a specific challenge
const getChallengeParticipants = async (req, res) => {
    try {
        // First, verify the challenge exists
        const communityChallenge = await CommunityChallenge.findOne({
            challengeId: req.params.id
        });

        if (!communityChallenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Get all participants for this challenge (exclude cancelled/withdrawn)
        const participants = await CommunityParticipant.find({
            challengeId: communityChallenge.challengeId,
            status: { $ne: 'cancelled' }  // Exclude cancelled participants
        })
            .sort({ joinedAt: 1 });  // Sort by who joined first

        res.status(200).json({
            challengeId: communityChallenge.challengeId,
            challengeTitle: communityChallenge.title,
            totalParticipants: participants.length,
            participants: participants
        });
    } catch (err) {
        console.error('Get challenge participants error:', err);
        res.status(500).json({ error: err.message });
    }
};

//  GET leaderboard with user details
const getCommunityChallengeLeaderboard = async (req, res) => {
    try {
        const communityChallenge = await CommunityChallenge.findOne({ challengeId: req.params.id });
        if (!communityChallenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        const participants = await CommunityParticipant.find({
            challengeId: communityChallenge.challengeId,
            status: 'joined'
        }).sort({ progress: -1 });

        // Fetch user details for each participant
        const User = require('../models/User');
        const leaderboard = await Promise.all(participants.map(async (p, index) => {
            let user = null;
            try {
                user = await User.findById(p.userId);
            } catch (err) {
                // User might not exist
            }

            return {
                rank: index + 1,
                userId: p.userId,
                userName: user ? user.name : `User ${p.userId.toString().slice(0, 6)}`,
                progress: p.progress,
                joinedAt: p.joinedAt
            };
        }));

        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET user's participation history (Authenticated users only)
const getUserParticipationHistory = async (req, res) => {
    try {
        const userId = req.userId; // From JWT

        const participations = await CommunityParticipant.find({ userId })
            .sort({ joinedAt: -1 });

        res.status(200).json(participations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Check if challenge ended and calculate winner (Admin only)
const checkChallengeEnded = async (req, res) => {
    try {
        const communityChallenge = req.challenge; // From ownership middleware

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

// GET user's joined challenges
const getUserJoinedChallenges = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware

    // Get all participations for this user
    const participations = await CommunityParticipant.find({
      userId,
      challengeId: { $ne: null },
      status: { $in: ['joined', 'completed'] }
    }).populate('challengeId');

   // Manually fetch challenge details (since challengeId is String)
    const joinedChallenges = [];
    for (const p of participations) {
      const challenge = await CommunityChallenge.findOne({ challengeId: p.challengeId });
      if (challenge) {
        joinedChallenges.push({
          challengeId: challenge.challengeId,
          title: challenge.title,
          description: challenge.description,
          targetDistance: challenge.targetDistance,  // ✅ This is missing!
          userProgress: p.progress,
          status: challenge.status,
          endDate: challenge.endDate,  // ✅ This is missing!
          joinedAt: p.joinedAt
        });
      }
    }

    res.status(200).json(joinedChallenges);
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
    checkChallengeEnded,
    getChallengeParticipants,
    getUserJoinedChallenges
};