const mongoose = require('mongoose');
const { type } = require('os');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  shipping: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  deliveredDate: {
    type: Date,
    default: null
  },
  paymentMode: {
    type: String,
    default: 'COD'
  },
  orderNumber: {
    type: Number,
    unique: true
  },
  status: {
    type: String,
    default: 'pending', // could be 'pending', 'delivered', 'cancelled'
    enum: ['pending', 'delivered', 'cancelled'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Order', orderSchema);
