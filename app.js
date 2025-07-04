const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport); // 👈 pass passport in
const MongoStore = require('connect-mongo');

dotenv.config({ path: './config.env' });

const app = express();

// Mongo session setup (will be used by Passport)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // 🧠 use URI directly here
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Init Passport after session
app.use(passport.initialize());
app.use(passport.session());

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());







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
