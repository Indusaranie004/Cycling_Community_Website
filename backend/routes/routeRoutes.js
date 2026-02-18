const express = require('express');
const router = express.Router();
const { createRoute, getRoutes, updateRoute } = require('../controllers/routeController');

// CREATE Route
// POST /api/routes
router.post('/newRoute', createRoute);

// READ Routes
// GET /api/routes
router.get('/viewRoutes', getRoutes);

// UPDATE Route
// PUT /api/routes/:id
router.put('/updateRoute/:id', updateRoute);

module.exports = router;