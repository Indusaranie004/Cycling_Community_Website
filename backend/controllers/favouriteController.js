const User = require('../models/User');
const Route = require('../models/Route');

// ADD to favorites
const addFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { routeId } = req.params;

    // Check if route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Only allow favoriting if route is public OR user owns it
    if (!route.isPublic && route.userId !== userId) {
      return res.status(403).json({ error: 'Cannot save private routes from other users' });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already favorited
    if (user.favoriteRoutes.includes(routeId)) {
      return res.status(400).json({ error: 'Route already in favorites' });
    }

    // Add to favorites
    user.favoriteRoutes.push(routeId);
    await user.save();

    res.status(200).json({
      message: 'Route added to favorites',
      favoriteRoutes: user.favoriteRoutes
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REMOVE from favorites
const removeFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { routeId } = req.params;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if route is in favorites
    if (!user.favoriteRoutes.includes(routeId)) {
      return res.status(400).json({ error: 'Route not in favorites' });
    }

    // Remove from favorites
    user.favoriteRoutes = user.favoriteRoutes.filter(id => id !== routeId);
    await user.save();

    res.status(200).json({
      message: 'Route removed from favorites',
      favoriteRoutes: user.favoriteRoutes
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all favorites
const getFavorites = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all favorited routes
    const routes = await Route.find({ _id: { $in: user.favoriteRoutes } });

    res.status(200).json({
      message: 'Favorites retrieved successfully',
      count: routes.length,
      routes
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites };