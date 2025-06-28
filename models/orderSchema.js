const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number
    }
  ],
  shippingAddress: {
    fullName: String,
    phone: String,
    line1: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  totalAmount: { type: Number, required: true },
  tx_ref: { type: String },
  invoiceUrl: String,
  trackingNumber: { type: String }, // ✅ make sure this exists
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered'],
    default: 'Pending'
  }
}, { timestamps: true });


module.exports = mongoose.model('Order', orderSchema);
