const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
    getAllInteractions,
    getInteractionById,
    createInteraction,
    updateInteraction,
    deactivateInteraction,
    deleteInteraction,
    getActiveHazards,
    getRouteFeedback
} = require('../controllers/interactionController');
const { requireAuth } = require('../middleware/auth/authRoute');
const { checkInteractionOwnership } = require('../middleware/auth/authInteraction');
const {
    validateCreateInteraction,
    validateUpdateInteraction,
    validateInteractionId,
    validateInteractionQuery
} = require('../middleware/validation/validateInteraction');

// --- ROUTES ---

// GET all
router.get('/', requireAuth, validateInteractionQuery, getAllInteractions);

router.get('/active-hazards', requireAuth, getActiveHazards);

router.get('/route/:routeId/feedback', requireAuth, getRouteFeedback);


// GET single
router.get('/:id', requireAuth, validateInteractionId, getInteractionById);

/**
 * POST Create Interaction
 * Order:
 * 1. requireAuth: Check login
 * 2. upload.single('image'): Process FormData and Image (Populates req.body)
 * 3. validateCreateInteraction: Check if fields are correct
 * 4. createInteraction: Save to DB
 */
router.post(
    '/', 
    requireAuth, 
    upload.single('image'), 
    validateCreateInteraction, // <--- Add this back!
    createInteraction
);

/**
 * PATCH Update Interaction
 * Order:
 * 1. requireAuth: Check login
 * 2. upload.single('image'): Process FormData (Populates req.body)
 * 3. validateUpdateInteraction: Check updated fields
 * 4. checkInteractionOwnership: Check if user is allowed to edit this
 * 5. updateInteraction: Save changes
 */
router.patch(
    '/:id',
    requireAuth,
    upload.single('image'),
    validateUpdateInteraction,
    checkInteractionOwnership,
    updateInteraction
);

// PATCH Deactivate
router.patch(
    '/:id/deactivate', 
    requireAuth, 
    validateInteractionId, 
    checkInteractionOwnership, 
    deactivateInteraction
);

// DELETE
router.delete(
    '/:id', 
    requireAuth, 
    validateInteractionId, 
    checkInteractionOwnership, 
    deleteInteraction
);

module.exports = router;