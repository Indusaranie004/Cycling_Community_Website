const express = require('express');
const router = express.Router();
const { createRide, getUserRides, updateRide, deleteRide } = require('../controllers/rideController');

// @route   POST /api/rides
router.post('/', createRide);

// @route   GET /api/rides/user/:userId
router.get('/user/:userId', getUserRides);

// @route   PUT /api/rides/:id
router.put('/:id', updateRide);

// @route   DELETE /api/rides/:id
router.delete('/:id', deleteRide);

module.exports = router;