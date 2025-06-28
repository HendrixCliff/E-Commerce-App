const Order = require('../models/orderSchema');
const Cart = require('../models/cartSchema');
const Product = require('../models/productSchema');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
const { sendOrderConfirmation } = require('../utils/sendEmail');
const { generateInvoiceBuffer } = require('../utils/generateInvoice');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { generateOrderFromCart } = require('../utils/order.utils');


exports.initBankTransfer = asyncErrorHandler(async (req, res) => {
  const userId = req.user._id;
  const { shippingAddress } = req.body;

  // 🧠 Generate unique transaction reference
  const tx_ref = `tx-${Date.now()}-${userId.toString().slice(-4)}`;

  // 🧾 Create the order with tx_ref and Pending status
  const order = await generateOrderFromCart(userId, shippingAddress, {
    tx_ref,
    paymentStatus: 'Pending'
  });

  // 💰 Prepare Flutterwave or payment payload
  const payload = {
    tx_ref,
    amount: order.totalAmount,
    currency: 'NGN',
    payment_options: 'banktransfer',
    redirect_url: 'https://yourfrontend.com/payment-complete', // 👈 update this
    customer: {
      email: req.user.email,
      name: shippingAddress.fullName || req.user.name
    },
    customizations: {
      title: 'Order Checkout',
      description: 'Bank transfer payment'
    }
  };

  // 🌍 Call Flutterwave (or whatever gateway you're using)
  const response = await flw.PaymentInitiation.initialize(payload);

  // 🏦 Extract bank transfer details
  const transferInfo = {
    bankName: response.data.meta.authorization.bank,
    accountNumber: response.data.meta.authorization.account_number,
    amount: response.data.amount,
    expiry: response.data.meta.authorization.expiry
  };

  // 🔁 Don't clear the cart here — already handled in generateOrderFromCart()

  res.status(200).json({
    message: 'Bank transfer initialized',
    tx_ref,
    orderId: order._id,
    transferInfo,
    paymentLink: response.data.link
  });
});



exports.webhookHandler = asyncErrorHandler(async (req, res) => {
   const hash = req.headers['verif-hash'];
  if (!hash || hash !== process.env.FLW_SECRET_HASH) return res.sendStatus(401);

  try {
    const event = req.body;

    if (
      event.event === 'charge.completed' &&
      event.data.status === 'successful'
    ) {
      const tx_ref = event.data.tx_ref;
      const order = await Order.findOne({ tx_ref }).populate('items.product user');

      if (!order) return res.status(404).json({ error: 'Order not found' });

      if (order.paymentStatus === 'Paid') {
        console.log(`⚠️ Order ${tx_ref} already paid. Skipping...`);
        return res.sendStatus(200);
      }

      // 🏷️ Deduct stock
      for (const item of order.items) {
        const product = await Product.findById(item.product._id);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }

      order.paymentStatus = 'Paid';
      await order.save();

      // 🧾 Generate invoice buffer
      const { buffer, fileName } = await generateInvoiceBuffer(order);

      // ☁️ Upload to Cloudinary
      await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
          folder: 'invoices',
          resource_type: 'raw',
          public_id: fileName.replace('.pdf', '')
        }, (error, result) => {
          if (error) return reject(error);

          order.invoiceUrl = result.secure_url;
          order.save().then(() => resolve());
        });

        streamifier.createReadStream(buffer).pipe(uploadStream);
      });

      // 📩 Email invoice
      await sendOrderConfirmation(
        order.user.email,
        'Order Confirmation',
        `<p>Your order has been confirmed. Invoice attached.</p>`,
        buffer,
        fileName
      );

      console.log(`✅ Order ${order._id} marked Paid. Invoice sent.`);
      return res.sendStatus(200);
    }

    return res.sendStatus(400);
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    return res.sendStatus(500);
  }
});



