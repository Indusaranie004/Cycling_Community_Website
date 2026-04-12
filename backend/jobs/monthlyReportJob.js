const cron = require('node-cron');
const Ride = require('../models/Ride');
const EcoImpact = require('../models/EcoImpact');
const CommunityStat = require('../models/CommunityStat');
const User = require('../models/User');
const { sendMonthlyReport } = require('../utils/emailService');

const scheduleMonthlyEmails = () => {
  // Cron Syntax: * * * * * = Every Minute (For Testing), 0 0 1 * * = Every month
  cron.schedule('0 0 1 * *', async () => { 
    console.log('⏳ Starting Monthly Report Generation...');

    try {
      let communityStats = await CommunityStat.findOne();

      if (!communityStats) {
        communityStats = {
          total_community_distance: 0,
          total_community_co2_saved: 0,
          total_rides: 0
        };
      }

      const users = await User.find().select('_id name email');

      for (const user of users) {
        
        const userRides = await Ride.find({ user_id: user._id }).select('_id');
        const rideIds = userRides.map(ride => ride._id);

        let stats = { totalCo2: 0, totalFuel: 0, totalCalories: 0, totalScore: 0 };
        
        if (rideIds.length > 0) {
          const aggregation = await EcoImpact.aggregate([
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
          if (aggregation.length > 0) stats = aggregation[0];
        }

        if (stats.totalScore > 0) {
          await sendMonthlyReport(user.email, user.name, stats, communityStats);
        }
      }

      console.log('✅ Monthly reports sent successfully.');

    } catch (error) {
      console.error(`❌ Cron Job Error (Monthly Reports):`, error.message);
    }
  });
};

module.exports = scheduleMonthlyEmails;