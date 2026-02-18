const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  startLocation: {
    type: String,
    required: true
  },
  endLocation: {
    type: String,
    required: true
  },
  coordinates: {
    type: [[Number]],
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  estimatedTime: {
    type: Number,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);