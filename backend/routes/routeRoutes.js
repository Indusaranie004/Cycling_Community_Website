const express = require('express');
const router = express.Router();
const { createRoute, getRoutes, updateRoute, deleteRoute, getNearbyRoutes } = require('../controllers/routeController');
const { requireAuth, verifyUserIdMatch, checkRouteOwnership } = require('../middleware/auth/authRoute');
const { validateCreateRoute, validateUpdateRoute, validateRouteId } = require('../middleware/validation/validateRoute');

// CREATE
router.post('/newRoute', requireAuth, validateCreateRoute, createRoute);

// READ
router.get('/viewRoutes', requireAuth, verifyUserIdMatch, getRoutes);

// NEARBY (new feature)
router.get('/nearby', requireAuth, getNearbyRoutes);

// UPDATE
router.put('/updateRoute/:id', requireAuth, validateUpdateRoute, checkRouteOwnership, updateRoute);

// DELETE
router.delete('/deleteRoute/:id', requireAuth, validateRouteId, checkRouteOwnership, deleteRoute);

module.exports = router;