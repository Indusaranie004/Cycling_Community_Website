const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth/authRoute');

// POST /api/users/register
router.post('/register', register);

// POST /api/users/login
router.post('/login', login);

// GET /api/users/profile (protected)
router.get('/profile', requireAuth, getProfile);

module.exports = router;