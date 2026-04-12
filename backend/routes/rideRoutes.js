const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth/authRide');

const { 
  createRide,
  getAllRides,
  getRideById,
  getMyRides,
  updateRide,
  deleteRide,
  getMyPersonalStats 
} = require('../controllers/rideController');

const { 
  validateCreateRide, 
  validateUpdateRide, 
  validateRideId 
} = require('../middleware/validation/rideValidation');

// @route   POST /api/rides
router.post('/', requireAuth, createRide);

// @route   GET /api/rides
router.get('/', getAllRides);

// @route   GET /api/rides/me
router.get('/me', requireAuth, getMyRides);

// @route   GET /api/rides/stats/me
router.get('/stats/me', requireAuth, getMyPersonalStats); 

// @route   GET /api/rides/:id
router.get('/:id', requireAuth, getRideById);

// @route   PUT /api/rides/:id
router.put('/:id', requireAuth, updateRide);

// @route   DELETE /api/rides/:id
router.delete('/:id', requireAuth, deleteRide);

// @route   POST /api/rides
router.post('/', requireAuth, validateCreateRide, createRide);

// @route   GET /api/rides/:id
router.get('/:id', requireAuth, validateRideId, getRideById);

// @route   PUT /api/rides/:id
router.put('/:id', requireAuth, validateUpdateRide, updateRide);

// @route   DELETE /api/rides/:id
router.delete('/:id', requireAuth, validateRideId, deleteRide);

module.exports = router;