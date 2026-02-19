const express = require('express');
const router = express.Router();
const { createRoute, getRoutes, updateRoute, deleteRoute } = require('../controllers/routeController');
const { requireAuth, verifyUserIdMatch, checkRouteOwnership } = require('../middleware/auth/authRoute');

// CREATE Route (requires authentication)
router.post('/newRoute', requireAuth, createRoute);

// READ Routes (verify userId if provided in query)
router.get('/viewRoutes', requireAuth, verifyUserIdMatch, getRoutes);

// UPDATE Route (requires ownership)
router.put('/updateRoute/:id', requireAuth, checkRouteOwnership, updateRoute);

// DELETE Route (requires ownership)
router.delete('/deleteRoute/:id', requireAuth, checkRouteOwnership, deleteRoute);

module.exports = router;