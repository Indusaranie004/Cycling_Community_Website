const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  // Foreign Keys (will connect to Users and Routes later)
  user_id: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'User', 
    type: String,
    required: true 
  },
  route_id: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'Route',
    type: String,
    required: false 
  },
  
  // Data Fields from Diagram
  /*ride_id: {
    type: String, 
    required: true
  },*/
  distance_km: {
    type: Number,
    required: true
  },
  duration_minutes: {
    type: Number,
    required: true
  },
  avg_speed: {
    type: Number,
    required: true
  },
  ride_date: {
    type: Date,
    default: Date.now
  },
  start_time: {
    type: String, 
    required: true
  },
  end_time: {
    type: String, 
  }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);