const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favouriteController');
const { requireAuth } = require('../middleware/auth/authRoute');
const { validateRouteId } = require('../middleware/validation/validateFavourite');

// GET all favorites
router.get('/', requireAuth, getFavorites);

// ADD to favorites
router.post('/:routeId', requireAuth, validateRouteId, addFavorite);

// REMOVE from favorites
router.delete('/:routeId', requireAuth, validateRouteId, removeFavorite);

module.exports = router;