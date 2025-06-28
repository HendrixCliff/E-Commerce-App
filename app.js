const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('./config/passport')(passport); // 👈 pass passport in


dotenv.config({ path: './config.env' });

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());





// Required for sessions to work
app.use(session({
  secret: process.env.SESSION_SECRET, // Use an ENV variable in production!
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());


// Routes
const authRoute = require('./routes/userRoute');
const productRoute = require('./routes/productRoutes');
const cartRoute = require('./routes/cartRoutes');
const orderRoute = require('./routes/orderRoutes');
const paymentRoute = require('./routes/paymentRoutes');
const adminRoute = require('./routes/adminRoutes');
const adminSectionRoute = require('./routes/adminSectionRoutes');

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/products', productRoute);
app.use('/api/v1/cart', cartRoute);
app.use('/api/v1/orders', orderRoute);
app.use('/api/v1/payment', paymentRoute);
app.use('/api/v1/admin/orders', adminRoute);
app.use('/api/v1/admin/sections', adminSectionRoute);

module.exports = app;
