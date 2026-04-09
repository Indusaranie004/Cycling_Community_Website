const jwt = require('jsonwebtoken');
const CommunityEvent = require('../../models/communityEvent');
const CommunityChallenge = require('../../models/communityChallenge');

// JWT Authentication Middleware
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Admin Role Check
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check Event Ownership
const checkEventOwnership = async (req, res, next) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const eventId = req.params.id;

    const event = await CommunityEvent.findOne({ eventId });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const isOwner = event.userId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not have permission to modify this event' 
      });
    }

    req.event = event;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check Challenge Ownership
const checkChallengeOwnership = async (req, res, next) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const challengeId = req.params.id;

    const challenge = await CommunityChallenge.findOne({ challengeId });
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const isOwner = challenge.userId === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not have permission to modify this challenge' 
      });
    }

    req.challenge = challenge;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  requireAuth, 
  requireAdmin, 
  checkEventOwnership, 
  checkChallengeOwnership 
};