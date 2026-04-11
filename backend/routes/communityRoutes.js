const express = require('express');
const router = express.Router();
const { getCommunityStats } = require('../controllers/communityStatController');

// @route   GET /api/community-stats
router.get('/', getCommunityStats);

module.exports = router;