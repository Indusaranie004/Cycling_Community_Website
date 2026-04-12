const EcoImpact = require('../models/EcoImpact');
const Ride = require('../models/Ride');

// @route   GET /api/impact (Admin Only)
const getAllImpacts = async (req, res) => {
  try {
    const impacts = await EcoImpact.find().populate({
      path: 'ride_id',
      populate: { path: 'user_id', select: '-password' }
    });
    res.status(200).json(impacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/impact/me
const getMyImpacts = async (req, res) => {
  try {
    const userRides = await Ride.find({ user_id: req.userId }).select('_id');
    const rideIds = userRides.map(ride => ride._id);
    
    const impacts = await EcoImpact.find({ ride_id: { $in: rideIds } }).populate('ride_id');
    res.status(200).json(impacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/impact/stats/me
const getMyImpactStats = async (req, res) => {
  try {
    const userRides = await Ride.find({ user_id: req.userId }).select('_id');
    const rideIds = userRides.map(ride => ride._id);

    const stats = await EcoImpact.aggregate([
      { $match: { ride_id: { $in: rideIds } } },
      {
        $group: {
          _id: null,
          totalCo2: { $sum: "$co2_saved_kg" },
          totalFuel: { $sum: "$fuel_saved_liters" },
          totalCalories: { $sum: "$calories_burned" },
          totalScore: { $sum: "$eco_score" }
        }
      }
    ]);

    if (stats.length === 0) {
        return res.status(200).json({ totalCo2: 0, totalFuel: 0, totalCalories: 0, totalScore: 0 });
    }

    res.status(200).json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/impact/:rideId
const getImpactByRideId = async (req, res) => {
  try {
    const impact = await EcoImpact.findOne({ ride_id: req.params.rideId }).populate('ride_id');
    
    if (!impact) return res.status(404).json({ message: "Impact report not found" });
    
    const rideOwnerId = impact.ride_id.user_id ? impact.ride_id.user_id.toString() : null;
    if (rideOwnerId !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: "Not authorized to view this impact" });
    }

    res.status(200).json(impact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllImpacts, getMyImpacts, getMyImpactStats, getImpactByRideId };