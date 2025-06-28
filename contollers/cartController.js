const Cart = require('../models/cartSchema');
const Product = require('../models/productSchema');
const asyncErrorHandler = require('../utils/asyncErrorHandler');





exports.getCart = asyncErrorHandler(async (req, res) => {
   const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) return res.json({ items: [] });

  res.json(cart);
});

exports.addToCart = asyncErrorHandler(async (req, res) => {
    const { productId, quantity } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  res.json(cart);
});

exports.removeFromCart = asyncErrorHandler(async (req, res) => {
   const userId = req.user._id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });

  cart.items = cart.items.filter(item => item.product.toString() !== productId);
  await cart.save();

  res.json(cart);
});

exports.updateItem  = asyncErrorHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return res.status(404).json({ error: 'Cart not found' });

  const item = cart.items.find(item => item.product.toString() === productId);
  if (!item) return res.status(404).json({ error: 'Product not in cart' });

  item.quantity = quantity;
  await cart.save();

  res.json(cart); 
});

