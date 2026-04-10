const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
    getAllInteractions,
    getInteractionById,
    createInteraction,
    updateInteraction,
    deactivateInteraction,
    deleteInteraction
} = require('../controllers/interactionController');
const { requireAuth } = require('../middleware/auth/authRoute');
const { checkInteractionOwnership } = require('../middleware/auth/authInteraction');
const {
    validateCreateInteraction,
    validateUpdateInteraction,
    validateInteractionId,
    validateInteractionQuery
} = require('../middleware/validation/validateInteraction');

// GET all
router.get('/', requireAuth, validateInteractionQuery, getAllInteractions);

// GET single
router.get('/:id', requireAuth, validateInteractionId, getInteractionById);

// POST create
// router.post('/', requireAuth, validateCreateInteraction, createInteraction);
router.post('/', requireAuth, upload.single('image'), createInteraction);

// PATCH update
// router.patch('/:id', requireAuth, validateUpdateInteraction, checkInteractionOwnership, updateInteraction);
router.patch('/:id',
  requireAuth,
  upload.single('image'),   // ✅ ADD THIS
  validateUpdateInteraction,
  checkInteractionOwnership,
  updateInteraction
);

// PATCH deactivate
router.patch('/:id/deactivate', requireAuth, validateInteractionId, checkInteractionOwnership, deactivateInteraction);

// DELETE
router.delete('/:id', requireAuth, validateInteractionId, checkInteractionOwnership, deleteInteraction);


// // /api/interactions
// router.get('/', getAllInteractions);
// router.post('/', createInteraction);

// // /api/interactions/:id
// router.get('/:id', getInteractionById);
// router.patch('/:id', updateInteraction);
// router.patch('/:id/deactivate', deactivateInteraction);
// router.delete('/:id', deleteInteraction);

module.exports = router;