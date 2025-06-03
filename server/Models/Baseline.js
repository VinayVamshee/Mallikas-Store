const mongoose = require('mongoose');

const baselineSchema = new mongoose.Schema({
  apparels_category: {
    type: [String],
    default: []
  },
  apparels_colors: {
    type: [String],
    default: []
  },
  apparels_sizes: {
    type: [String],
    default: []
  },
  accessories_category: {
    type: [String],
    default: []
  },
  accessories_colors: {
    type: [String],
    default: []
  },
  accessories_sizes: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Baseline', baselineSchema);
