const express = require('express');
const router = express.Router();
const { createRoute, getRoutes, updateRoute, deleteRoute } = require('../controllers/routeController');

// CREATE Route
// POST /api/routes
router.post('/newRoute', createRoute);

// READ Routes
// GET /api/routes
router.get('/viewRoutes', getRoutes);

// UPDATE Route
// PUT /api/routes/:id
router.put('/updateRoute/:id', updateRoute);

// DELETE Route
// DELETE /api/routes/:id
router.delete('/deleteRoute/:id', deleteRoute);

module.exports = router;