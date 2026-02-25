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

// /api/community/challenges
router.get('/', getAllCommunityChallenges);
router.post('/', createCommunityChallenge);

// /api/community/challenges/:id
router.get('/:id', getCommunityChallengeById);
router.get('/:id/participants', getChallengeParticipants); 
router.get('/:id/leaderboard', getCommunityChallengeLeaderboard);
router.post('/:id/join', joinCommunityChallenge);
router.put('/:id/progress', updateCommunityChallengeProgress);
router.post('/:id/check-ended', checkChallengeEnded);

// /api/community/challenges/user/:userId
router.get('/user/:userId', getUserParticipationHistory);

module.exports = router;