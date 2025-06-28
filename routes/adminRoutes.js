const express = require('express');
const { addTrackingNumber } = require('../contollers/orderController');
const isAdmin = require('../middleware/isAdmin');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.use(isAuth, isAdmin); // all below routes are admin-only

router.put('/:id/tracking', addTrackingNumber);

module.exports = router;