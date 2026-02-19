const Route = require('../../models/Route');

// Set authenticated user once
const requireAuth = (req, res, next) => {
  const userId = "test-user-123"; // ← Change here for Clerk
  const userRole = "user"; // ← Change here for Clerk
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  req.userId = userId;
  req.userRole = userRole;
  next();
};

// Use req.userId (set by requireAuth)
const verifyUserIdMatch = (req, res, next) => {
  const authenticatedUserId = req.userId;
  const requestedUserId = req.query.userId;
  
  if (!requestedUserId) {
    return next();
  }
  
  if (requestedUserId !== authenticatedUserId) {
    req.showPublicOnly = true;
  }
  
  next();
};

// Use req.userId and req.userRole (set by requireAuth)
const checkRouteOwnership = async (req, res, next) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const routeId = req.params.id;

    const route = await Route.findById(routeId);
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const isOwner = route.userId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not have permission to modify this route' 
      });
    }

    req.route = route;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  requireAuth, 
  verifyUserIdMatch, 
  checkRouteOwnership 
};