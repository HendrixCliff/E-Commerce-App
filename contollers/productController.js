const Product = require('../models/productSchema');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const slugify = require('slugify');


exports.createProduct = asyncErrorHandler(async (req, res) => {
  try {
    const images =
      (req.files && req.files.map(file => file.path)) ||
      (process.env.NODE_ENV !== 'production' ? req.body.images || [] : []);

    // 🆕 Generate slug from name
    const name = req.body.name;
    const slug = slugify(name, { lower: true, strict: true });

    const product = await Product.create({
      ...req.body,
      slug,
      images
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

exports.getAllProducts = asyncErrorHandler(async (req, res) => {
  try {
    // 🧮 Parse pagination values from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // 🔍 Fetch total count for frontend pagination
    const total = await Product.countDocuments();

    // 📦 Fetch paginated products
    const products = await Product.find().skip(skip).limit(limit);

    res.status(200).json({
      total,            // Total number of products
      page,             // Current page
      pages: Math.ceil(total / limit), // Total pages
      results: products // Paginated results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




exports.getProductByIdOrSlug = asyncErrorHandler(async (req, res) => {
  const { identifier } = req.params;

  try {
    // Check if it's a valid ObjectId
    const isObjectId = /^[a-f\d]{24}$/i.test(identifier);

    const product = isObjectId
      ? await Product.findById(identifier)
      : await Product.findOne({ slug: identifier });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.getProductsByCategory = asyncErrorHandler(async (req, res) => {
  try {
    const category = req.params.category.toLowerCase().trim();

    const products = await Product.find({ category });

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



exports.updateProduct = asyncErrorHandler(async (req, res) => {
    try {
    const images = req.files?.map(file => file.path) || [];
    const updatedData = { ...req.body };
    if (images.length > 0) updatedData.images = images;

    const product = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!product) return res.status(404).json({ error: 'Not found' });

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

exports.deleteProduct = asyncErrorHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



