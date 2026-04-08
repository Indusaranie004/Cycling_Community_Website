const CommunityStat = require('../models/CommunityStat');

// @route   GET /api/community-stats
const getCommunityStats = async (req, res) => {
  try {
    let stats = await CommunityStat.findOne();

    if (!stats) {
      return res.status(200).json({
        total_community_distance: 0,
        total_community_co2_saved: 0,
        total_rides: 0
      });
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCommunityStats };