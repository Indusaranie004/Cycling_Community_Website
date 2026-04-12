const mongoose = require('mongoose');

const communityStatSchema = new mongoose.Schema({
  // Data Fields from Diagram
  /*stat_id: {
    type: String,
    required: true
  },*/
  total_community_distance: {
    type: Number,
    default: 0
  },
  total_community_co2_saved: {
    type: Number,
    default: 0
  },
  total_rides: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('CommunityStat', communityStatSchema);