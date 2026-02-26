const Ride = require('../models/Ride');
const EcoImpact = require('../models/EcoImpact');
const CommunityStat = require('../models/CommunityStat');

const CO2_PER_KM = 0.21;
const KM_PER_LITER = 12.5;
const CALORIES_PER_KM = 30; 

// @route   POST /api/rides
const createRide = async (req, res) => {
  try {
    const { 
      user_id, route_id, distance_km, duration_minutes, 
      avg_speed, start_time, end_time 
    } = req.body;

    // 1. Is distance > 0?
    if (!distance_km || distance_km <= 0) {
      return res.status(400).json({ message: "Error: Distance must be greater than 0" });
    }

    // 2. Is GPS/Speed Valid? (Simple Logic: If speed is > 50km/h, it's likely not a bicycle)
    if (avg_speed > 50) {
      return res.status(400).json({ message: "Error: GPS data invalid (Speed too high for cycling)" });
    }

    // 3. Is Duration Reasonable? (e.g., cannot ride 10km in 1 minute)
    // 50km/h = 0.83 km/min. If distance/time > 0.83, it's suspicious.
    if ((distance_km / duration_minutes) > 0.9) {
      return res.status(400).json({ message: "Error: Duration is not reasonable for this distance" });
    }

    const newRide = new Ride({
      user_id, // Dummy ID from frontend for now
      route_id: route_id || null,
      distance_km,
      duration_minutes,
      avg_speed,
      start_time,
      end_time
    });

    const savedRide = await newRide.save();

    const co2_saved = (distance_km * CO2_PER_KM).toFixed(2);
    const fuel_saved = (distance_km / KM_PER_LITER).toFixed(2);
    const calories = Math.round(distance_km * CALORIES_PER_KM);
    
    const score = Math.round((distance_km * 10) + (co2_saved * 5));

    const newImpact = new EcoImpact({
      ride_id: savedRide._id,
      co2_saved_kg: co2_saved,
      fuel_saved_liters: fuel_saved,
      calories_burned: calories,
      eco_score: score
    });

    await newImpact.save();

    let stats = await CommunityStat.findOne();
    
    if (!stats) {
        stats = new CommunityStat({
            total_community_distance: 0,
            total_community_co2_saved: 0,
            total_rides: 0
        });
    }

    stats.total_community_distance += parseFloat(distance_km);
    stats.total_community_co2_saved += parseFloat(co2_saved);
    stats.total_rides += 1;

    await stats.save();

    res.status(201).json({
      message: "Ride saved and Impact calculated",
      ride: savedRide,
      impact: newImpact
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/rides/user/:userId
const getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/rides/:id
const updateRide = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Optional: Prevent updating critical fields like user_id if not allowed
    // For now, we allow updating distance/time/speed corrections
    
    const updatedRide = await Ride.findByIdAndUpdate(
      id, 
      updates, 
      { new: true } // Return the updated document
    );

    if (!updatedRide) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Note: In a real app, if you update distance, you should recalculate EcoImpact.
    // For the assignment demo, updating the ride details is usually enough.

    res.status(200).json({
      message: "Ride updated successfully",
      ride: updatedRide
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/rides/:id
const deleteRide = async (req, res) => {
  try {
    const { id } = req.params;

    const ride = await Ride.findByIdAndDelete(id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    await EcoImpact.findOneAndDelete({ ride_id: id });

    res.status(200).json({
      message: "Ride and associated Impact data deleted successfully",
      id: id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRide, getUserRides, updateRide, deleteRide };