const express = require('express');
const router = express.Router();
const { register, login, getProfile, getUserCommunityProfile } = require('../controllers/userController');
//const { register, login, getProfile } = require('../controllers/userController');
//const { requireAuth } = require('../middleware/auth/authRoute');
const { requireAuth } = require('../middleware/auth/authCommunity'); 

// POST /api/users/register
router.post('/register', register);

// POST /api/users/login
router.post('/login', login);

// GET /api/users/profile (protected)
router.get('/profile', requireAuth, getProfile);

// GET /api/users/profile/community (protected) - Community profile with stats
router.get('/profile/community', requireAuth, getUserCommunityProfile);


module.exports = router;