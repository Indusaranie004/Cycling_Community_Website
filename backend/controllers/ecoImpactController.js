const EcoImpact = require('../models/EcoImpact');
const Ride = require('../models/Ride');

// @route   GET /api/impact/:rideId
const getImpactByRideId = async (req, res) => {
  try {
    const impact = await EcoImpact.findOne({ ride_id: req.params.rideId });
    if (!impact) return res.status(404).json({ message: "Impact report not found" });
    res.status(200).json(impact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/impact/stats/:userId
const getUserImpactStats = async (req, res) => {
  try {
    const userRides = await Ride.find({ user_id: req.params.userId }).select('_id');
    
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

module.exports = { getImpactByRideId, getUserImpactStats };