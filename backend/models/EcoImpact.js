const mongoose = require('mongoose');

const ecoImpactSchema = new mongoose.Schema({
  ride_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true,
    unique: true
  },

  // Data Fields from Diagram
/*   impact_id: {
    type: String,
    required: true
  },*/
  co2_saved_kg: {
    type: Number,
    required: true
  },
  fuel_saved_liters: {
    type: Number,
    required: true
  },
  calories_burned: {
    type: Number,
    required: true
  },
  eco_score: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('EcoImpact', ecoImpactSchema);