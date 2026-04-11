const Ride = require('../models/Ride');
const EcoImpact = require('../models/EcoImpact');
const CommunityStat = require('../models/CommunityStat');
const mongoose = require('mongoose');

const CO2_PER_KM = 0.21;
const KM_PER_LITER = 12.5;
const CALORIES_PER_KM = 30; 

const calculateEcoImpact = (distance_km) => {
  const co2_saved_kg = parseFloat((distance_km * CO2_PER_KM).toFixed(2));
  const fuel_saved_liters = parseFloat((distance_km / KM_PER_LITER).toFixed(2));
  const calories_burned = Math.round(distance_km * CALORIES_PER_KM);
  const eco_score = Math.round((distance_km * 10) + (co2_saved_kg * 5));
  return { co2_saved_kg, fuel_saved_liters, calories_burned, eco_score };
};

const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('user_id route_id')
      .sort({ createdAt: -1 });
      
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/rides
const createRide = async (req, res) => {
  const user_id = req.userId; // Matches the middleware below!
  
  try {
    const { route_id, distance_km, duration_minutes, start_time, end_time } = req.body;

    //if (!distance_km || distance_km <= 0) return res.status(400).json({ message: "Error: Distance > 0" });
    
    const avg_speed = distance_km / (duration_minutes / 60);
    if (avg_speed > 50) return res.status(400).json({ message: "Error: Speed too high" });
    //if (!duration_minutes || duration_minutes <= 0) return res.status(400).json({ message: "Error: Invalid duration" });

    const newRide = new Ride({
      user_id: new mongoose.Types.ObjectId(user_id),
      route_id: route_id ? new mongoose.Types.ObjectId(route_id) : null,
      distance_km, duration_minutes, avg_speed, start_time, end_time
    });
    const savedRide = await newRide.save();
    
    const impactData = calculateEcoImpact(distance_km);
    const newImpact = new EcoImpact({ ride_id: savedRide._id, ...impactData });
    await newImpact.save();

    let stats = await CommunityStat.findOne();
    if (!stats) stats = new CommunityStat({ total_community_distance: 0, total_community_co2_saved: 0, total_rides: 0 });

    stats.total_community_distance += parseFloat(distance_km);
    stats.total_community_co2_saved += impactData.co2_saved_kg;
    stats.total_rides += 1;
    await stats.save();

    res.status(201).json({ message: "Ride saved", ride: savedRide, impact: newImpact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/rides/me
const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user_id: req.userId }).populate('route_id').sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/rides/stats/me
const getMyPersonalStats = async (req, res) => {
  try {
    const userId = req.userId; // Get logged-in user from token

    const stats = await Ride.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total_rides: { $sum: 1 }, // Counts how many rides they have
          total_distance: { $sum: "$distance_km" }, // Adds up all the distance
          total_duration: { $sum: "$duration_minutes" } // Adds up all the time
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        total_rides: 0,
        total_distance: 0,
        total_duration: 0
      });
    }

    res.status(200).json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/rides/:id
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('user_id route_id');
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    
    if (ride.user_id._id.toString() !== req.userId) {
       return res.status(403).json({ message: "Not authorized to view this ride" });
    }

    res.status(200).json(ride);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/rides/:id
const updateRide = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;
    const updates = req.body;

    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.user_id.toString() !== user_id) {
      return res.status(403).json({ message: "Not authorized to update this ride" });
    }

    const oldDistance = ride.distance_km;

    if (updates.distance_km) ride.distance_km = updates.distance_km;
    if (updates.duration_minutes) ride.duration_minutes = updates.duration_minutes;
    if (updates.start_time) ride.start_time = updates.start_time;
    if (updates.end_time) ride.end_time = updates.end_time;

    ride.avg_speed = parseFloat((ride.distance_km / (ride.duration_minutes / 60)).toFixed(2));
    if (ride.avg_speed > 50) return res.status(400).json({ message: "Calculated speed too high" });

    await ride.save();

    const impactData = calculateEcoImpact(ride.distance_km);
    await EcoImpact.findOneAndUpdate({ ride_id: id }, impactData);

    const stats = await CommunityStat.findOne();
    if (stats) {
      stats.total_community_distance += (ride.distance_km - oldDistance);
      stats.total_community_co2_saved += (impactData.co2_saved_kg - (oldDistance * CO2_PER_KM));
      await stats.save();
    }

    res.status(200).json({ message: "Ride updated", ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/rides/:id
const deleteRide = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;

    const ride = await Ride.findById(id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.user_id.toString() !== user_id) {
      return res.status(403).json({ message: "Not authorized to delete this ride" });
    }

    await ride.deleteOne(); 

    const impact = await EcoImpact.findOneAndDelete({ ride_id: id });

    const stats = await CommunityStat.findOne();
    if (stats) {
      stats.total_community_distance -= ride.distance_km;
      stats.total_community_co2_saved -= impact ? impact.co2_saved_kg : 0;
      stats.total_rides -= 1;
      await stats.save();
    }

    res.status(200).json({ message: "Ride deleted successfully", id: id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllRides, getMyPersonalStats, createRide, getMyRides, getRideById, updateRide, deleteRide };