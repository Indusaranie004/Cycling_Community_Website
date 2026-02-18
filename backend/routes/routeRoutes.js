const express = require('express');
const router = express.Router();
const { createRoute } = require('../controllers/routeController');

// CREATE Route
// POST /api/routes
router.post('/newRoute', createRoute);

module.exports = router;