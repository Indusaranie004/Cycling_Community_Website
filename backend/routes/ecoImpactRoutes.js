const express = require('express');
const router = express.Router();
const { getImpactByRideId, getUserImpactStats } = require('../controllers/ecoImpactController');

// @route   GET /api/impact/:rideId
router.get('/:rideId', getImpactByRideId);

// @route   GET /api/impact/stats/:userId
router.get('/stats/:userId', getUserImpactStats);

module.exports = router;