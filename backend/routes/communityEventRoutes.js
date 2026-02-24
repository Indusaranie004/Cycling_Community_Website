const express = require('express');
const router = express.Router();
const {
    getAllCommunityEvents,
    getCommunityEventById,
    createCommunityEvent,
    joinCommunityEvent,
    getEventParticipants,
    withdrawFromEvent,
    updateCommunityEvent,
    deleteCommunityEvent
} = require('../controllers/communityEventController');

// /api/community/events
router.get('/', getAllCommunityEvents);
router.post('/', createCommunityEvent);

// /api/community/events/:id
router.get('/:id', getCommunityEventById);
router.get('/:id/participants', getEventParticipants);
router.post('/:id/join', joinCommunityEvent);
router.post('/:id/withdraw', withdrawFromEvent);
router.patch('/:id', updateCommunityEvent);
router.delete('/:id', deleteCommunityEvent);

module.exports = router;