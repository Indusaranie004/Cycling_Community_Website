const express = require('express');
const router = express.Router();
const {
    getAllCommunityChallenges,
    getCommunityChallengeById,
    createCommunityChallenge,
    joinCommunityChallenge,
    updateCommunityChallengeProgress,
    getCommunityChallengeLeaderboard,
    getUserParticipationHistory,
    checkChallengeEnded,
    getChallengeParticipants 
} = require('../controllers/communityChallengeController');

const { 
  requireAuth, 
  requireAdmin, 
  checkChallengeOwnership 
} = require('../middleware/auth/authCommunity');

// /api/community/challenges
router.get('/', getAllCommunityChallenges);
router.post('/', requireAuth, requireAdmin, createCommunityChallenge);

// /api/community/challenges/:id
router.get('/:id', getCommunityChallengeById);
router.get('/:id/participants', getChallengeParticipants); 
router.get('/:id/leaderboard', getCommunityChallengeLeaderboard);
router.post('/:id/join', requireAuth, joinCommunityChallenge);
router.put('/:id/progress', requireAuth, updateCommunityChallengeProgress);
router.post('/:id/check-ended', requireAuth, requireAdmin, checkChallengeOwnership, checkChallengeEnded);

// /api/community/challenges/user/:userId
router.get('/user/:userId', requireAuth, getUserParticipationHistory);

module.exports = router;