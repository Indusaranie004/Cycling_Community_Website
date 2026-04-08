// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verifies the token using your secret key from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user ID to the request object so the controller can use it
    req.userId = decoded.userId;  
    req.userRole = decoded.role;  
    
    next(); // Move on to the controller
  } catch (error) {
    console.log("JWT Error:", error.message); 
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { requireAuth };