const express = require('express');
const router = express.Router();

const { requireAuth, requireAdmin } = require('../middleware/auth/authRide');

const { 
  getAllImpacts, 
  getMyImpacts, 
  getMyImpactStats, 
  getImpactByRideId 
} = require('../controllers/ecoImpactController');

// @route   GET /api/impact
router.get('/', requireAuth, getAllImpacts);

// @route   GET /api/impact/me
router.get('/me', requireAuth, getMyImpacts);

// @route   GET /api/impact/stats/me
router.get('/stats/me', requireAuth, getMyImpactStats);

// @route   GET /api/impact/:rideId
router.get('/:rideId', requireAuth, getImpactByRideId);

module.exports = router;