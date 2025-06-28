const Order = require('../models/orderSchema');
const Cart = require('../models/cartSchema');
const { generateTrackingNumber } = require('../utils/generateTracking');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { generateOrderFromCart } = require('../utils/order.utils');

exports.createOrder = asyncErrorHandler(async (req, res) => {
  const order = await generateOrderFromCart(req.user._id, req.body.shippingAddress);
  res.status(201).json(order);
});


exports.getUserOrders = asyncErrorHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    res.json(orders);
});

exports.getAllOrders = asyncErrorHandler(async (req, res) => {
   const orders = await Order.find().populate('user items.product');
    res.json(orders);
});

exports.updateOrderStatus = asyncErrorHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) return res.status(404).json({ error: 'Order not found' });

  res.json(order);
});


exports.downloadInvoiceAPI = asyncErrorHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Only owner or admin
  const isOwner = order.user._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Unauthorized' });

  if (order.invoiceUrl) {
    return res.json({ url: order.invoiceUrl });
  } else {
    return res.status(404).json({ message: 'Invoice not available yet' });
  }
});

exports.addTrackingNumber = asyncErrorHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // 🧠 Auto-generate tracking number
  const trackingNumber = generateTrackingNumber();
  order.trackingNumber = trackingNumber;
  order.status = 'Shipped';

  // Save the order with the new tracking number 
await order.save();

  res.json({
    message: 'Tracking number generated and order marked as shipped',
    trackingNumber
  });
});







