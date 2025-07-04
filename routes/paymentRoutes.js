const express = require('express');
const { initBankTransfer, webhookHandler } = require('../contollers/paymentContoller');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.post('/bank-transfer', isAuth, initBankTransfer);
router.post('/webhook', express.raw({ type: '*/*' }), webhookHandler);

module.exports = router;
