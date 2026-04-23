const path = require('path'); 
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
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'simple-secret',
    resave: false,
    saveUninitialized: false
  })
);

app.use((req, res, next) => {
  res.locals.currentUserId = req.session.userId || null;
  next();
});

app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/boards');
  }

  return res.redirect('/auth/login');
});

app.use('/auth', authRoutes);
app.use('/boards', boardRoutes);
app.use('/lists', listRoutes);
app.use('/cards', cardRoutes);

app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).send('Internal server Error');
});

async function startServer() {
  const dbUrl = process.env.DB_URL || process.env.gitDB_URL;

  if (!dbUrl) {
    console.error('DB_URL is missing. Create a .env file and add your MongoDB connection string.');
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUrl);
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