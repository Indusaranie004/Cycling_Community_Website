const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true 
  },
  route_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
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