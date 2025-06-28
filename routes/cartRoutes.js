const express = require('express');
const isAuth = require('../middleware/isAuth');
const {
  getCart,
  addToCart,
  removeFromCart,
  updateItem
} = require('../contollers/cartController');

const router = express.Router();



router.use(isAuth);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateItem);
router.delete('/remove/:productId', removeFromCart);

module.exports = router;
