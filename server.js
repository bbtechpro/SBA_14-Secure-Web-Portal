const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const express = require('express');
const { initializePassport } = require('./utils/passportJwt');
require('./utils/passportGhub');
const userRoutes = require('./routes/userRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/basic-login-system';
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  });

// Essential built-in parsing middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

initializePassport(app);

// Simple route logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Reject body requests missing Content-Type in a clearer way
app.use((req, res, next) => {
  const hasBodyMethod = ['POST', 'PUT', 'PATCH'].includes(req.method);
  if (!hasBodyMethod) {
    return next();
  }

  const contentType = req.headers['content-type'];
  const bodyIsEmpty = !req.body || Object.keys(req.body).length === 0;

  if (!contentType && bodyIsEmpty) {
    return res.status(400).json({
      message: 'Request body is empty or Content-Type header is missing.',
      hint: 'Set Content-Type: application/json and send raw JSON, or use x-www-form-urlencoded if using form data.'
    });
  }

  next();
});

// Mount the modular user routes
app.use('/api/users', userRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
