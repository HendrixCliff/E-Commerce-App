const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: String,
  slug: {
  type: String,
  unique: true,
  required: true,
  trim: true,
  lowercase: true
},
  images: [String], // URLs from Cloudinary
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
// This schema defines a Product model with fields for name, description, price, stock, category, and images.