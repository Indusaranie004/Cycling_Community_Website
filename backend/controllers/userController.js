const User = require('../models/User');
const CommunityParticipant = require('../models/communityParticipant');
const CommunityEvent = require('../models/communityEvent');
const CommunityChallenge = require('../models/communityChallenge');
const jwt = require('jsonwebtoken');

// Helper: generate token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET PROFILE (protected)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ NEW: GET COMMUNITY PROFILE with statistics
const getUserCommunityProfile = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware

    // Find user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's participations (using String userId)
    const participations = await CommunityParticipant.find({ 
      userId: userId,  // String comparison
      status: { $in: ['joined', 'completed'] }
    }).sort({ joinedAt: -1 });

    // Calculate statistics
    const eventsJoined = participations.filter(p => p.eventId).length;
    const challengesJoined = participations.filter(p => p.challengeId).length;
    const totalDistance = participations.reduce((sum, p) => sum + (p.progress || 0), 0);
    const co2Saved = (totalDistance * 0.27).toFixed(1);

    // Get events with names - MANUAL fetch (since eventId is String)
    const recentEvents = [];
    for (const p of participations.filter(p => p.eventId)) {
      const event = await CommunityEvent.findOne({ eventId: p.eventId });
      if (event) {
        recentEvents.push({
          eventId: event.eventId,
          title: event.title,  // ✅ Event name
          location: event.location,
          eventDate: event.eventDate,
          status: event.status,
          joinedAt: p.joinedAt  // ✅ When user joined
        });
      }
    }

    // Get challenges with names - MANUAL fetch (since challengeId is String)
    const recentChallenges = [];
    for (const p of participations.filter(p => p.challengeId)) {
      const challenge = await CommunityChallenge.findOne({ challengeId: p.challengeId });
      if (challenge) {
        recentChallenges.push({
          challengeId: challenge.challengeId,
          title: challenge.title,  // ✅ Challenge name
          targetDistance: challenge.targetDistance,
          progress: p.progress,  // ✅ User's progress
          status: challenge.status,
          joinedAt: p.joinedAt  // ✅ When user joined
        });
      }
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      statistics: {
        eventsJoined,
        challengesJoined,
        totalDistance: totalDistance.toFixed(1),
        co2Saved
      },
      recentEvents,
      recentChallenges
    });
  } catch (err) {
    console.error('Get community profile error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getProfile, getUserCommunityProfile };