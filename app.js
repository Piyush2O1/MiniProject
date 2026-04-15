const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/board');
const listRoutes = require('./routes/list');
const cardRoutes = require('./routes/card');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'simple-secret',
    resave: false,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  req.userId = req.session.userId || null;
  next();
});

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.use('/auth', authRoutes);
app.use('/boards', boardRoutes);
app.use('/lists', listRoutes);
app.use('/cards', cardRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    message: 'Internal server error'
  });
});

async function startServer() {
  if (!process.env.DB_URL) {
    console.error('DB_URL is missing. Create a .env file and add your MongoDB connection string.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

startServer();
