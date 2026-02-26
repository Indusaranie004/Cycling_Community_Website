const express = require('express');
const router = express.Router();
const { createRide, getUserRides } = require('../controllers/rideController');

// @route   POST /api/rides
router.post('/', createRide);

// @route   GET /api/rides/user/:userId
router.get('/user/:userId', getUserRides);

module.exports = router;