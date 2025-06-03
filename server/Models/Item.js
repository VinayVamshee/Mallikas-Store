const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  price: {
    type: Number
  },
  category: {
    type: String
  },
  sub_category: {
    type: String
  },
  color: {
    type: String
  },
  size: {
    type: String,
  },
  mainImage: {
    type: String
  },
  otherImages: {
    type: [String],
    default: []
  },
  available: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
