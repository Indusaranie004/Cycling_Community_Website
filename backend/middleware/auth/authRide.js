const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FIX: match your JWT payload exactly
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // 🔍 DEBUG (remove later)
    console.log("AUTH RIDE USER:", req.userId);

    if (!req.userId) {
      return res.status(401).json({ error: 'Invalid token payload (no userId)' });
    }

    next();
  } catch (error) {
    console.log("JWT Error:", error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { requireAuth };