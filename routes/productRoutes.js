const express = require('express');
const router = express.Router();
const parser = require('../config/multer');
const {
  createProduct,
  getAllProducts,
  getProductByIdOrSlug,
  getProductsByCategory,
  updateProduct,
  deleteProduct
} = require('../contollers/productController');

const isAuth = require('../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');

// 🟢 PUBLIC ROUTES
router.get('/', getAllProducts);
// Category-based route (must be ABOVE the generic `/:id` route)
router.get('/category/:category', getProductsByCategory);
router.get('/:identifier', getProductByIdOrSlug);

// 🔒 ADMIN-ONLY ROUTES
             
router.post('/', parser.array('images'),   isAuth, isAdmin, createProduct);
router.put('/:id', parser.array('images'), isAuth, isAdmin, updateProduct);             
router.delete('/:id', isAuth, isAdmin, deleteProduct);

module.exports = router;
