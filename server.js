const mongoose = require('mongoose');
const app = require('./app');
const session = require('express-session');
const MongoStore = require('connect-mongo');

require('dotenv').config({ path: './config.env' });

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient()
      }),
      cookie: { maxAge: 1000 * 60 * 60 * 24 }
    }));

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
})();
