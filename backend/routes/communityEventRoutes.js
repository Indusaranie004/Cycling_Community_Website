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

const { requireAuth, requireAdmin, checkEventOwnership } = require('../middleware/auth/authCommunity');

// /api/community/events
router.get('/', getAllCommunityEvents);
router.post('/', requireAuth, requireAdmin, createCommunityEvent);

// /api/community/events/:id
router.get('/:id', getCommunityEventById);
router.get('/:id/participants', getEventParticipants);
router.post('/:id/join', requireAuth, joinCommunityEvent);
router.post('/:id/withdraw', requireAuth, withdrawFromEvent);
router.patch('/:id', requireAuth, requireAdmin, checkEventOwnership, updateCommunityEvent);
router.delete('/:id', requireAuth, requireAdmin, checkEventOwnership, deleteCommunityEvent);


module.exports = router;