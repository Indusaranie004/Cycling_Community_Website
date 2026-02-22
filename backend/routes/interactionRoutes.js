const express = require('express');
const router = express.Router();
const {
    getAllInteractions,
    getInteractionById,
    createInteraction,
    updateInteraction,
    deactivateInteraction,
    deleteInteraction
} = require('../controllers/interactionController');

// /api/interactions
router.get('/', getAllInteractions);
router.post('/', createInteraction);

// /api/interactions/:id
router.get('/:id', getInteractionById);
router.patch('/:id', updateInteraction);
router.patch('/:id/deactivate', deactivateInteraction);
router.delete('/:id', deleteInteraction);

module.exports = router;