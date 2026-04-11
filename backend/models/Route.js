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
  // Original user-clicked waypoints — used to reload editable pins on update
  waypoints: {
    type: [[Number]],
    default: []
  },
  startPoint: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      default: [0, 0]
    }
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

// Geospatial index for location-based queries
routeSchema.index({ startPoint: '2dsphere' });

module.exports = mongoose.model('Route', routeSchema);