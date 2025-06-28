const Order = require('../models/orderSchema');
const Cart = require('../models/cartSchema');

// utils/order.utils.js
exports.generateOrderFromCart = async (userId, shippingAddress, customFields = {}) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  const items = cart.items.map(item => ({
    product: item.product._id,
    quantity: item.quantity
  }));

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const order = await Order.create({
    user: userId,
    items,
    shippingAddress,
    totalAmount,
    ...customFields
  });

  await Cart.deleteOne({ user: userId });

  return order;
};
