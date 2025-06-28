const express = require('express');
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  downloadInvoiceAPI,
} = require('../contollers/orderController');

const router = express.Router();
const isAuth = require('../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');

router.use(isAuth);

router.post('/', isAuth, createOrder);
router.get('/my', isAuth, getUserOrders);
router.get('/:id/invoice', isAuth, downloadInvoiceAPI);

// Admin-only   
router.get('/', isAdmin, getAllOrders);
router.put('/:id/status', isAdmin,  updateOrderStatus);

module.exports = router;
