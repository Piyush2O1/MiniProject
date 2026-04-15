<<<<<<< HEAD
const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');

const { connectToDatabase } = require('./lib/database');

dotenv.config();

=======
const path = require('path'); 
const express = require('express');  
const mongoose = require('mongoose');   
const session = require('express-session');
const dotenv = require('dotenv');

>>>>>>> 51bc1e1d31230683fb665d3668dcecd8796ca3ad
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/board');
const listRoutes = require('./routes/list');
const cardRoutes = require('./routes/card');

<<<<<<< HEAD
const mongoUri = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI environment variable.');
}

if (!sessionSecret) {
  throw new Error('Missing SESSION_SECRET environment variable.');
}

const app = express();
const databaseReady = connectToDatabase(mongoUri);

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.locals.formatDateInput = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await databaseReady;
    return next();
  } catch (error) {
    return next(error);
  }
});

app.use(
  session({
    secret: sessionSecret,
    proxy: process.env.NODE_ENV === 'production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions'
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

=======
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

>>>>>>> 51bc1e1d31230683fb665d3668dcecd8796ca3ad
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
<<<<<<< HEAD
  return res.status(404).render('error', {
    pageTitle: 'Page Not Found',
    message: 'The page you requested could not be found.'
  });
=======
  res.status(404).send('Page not found');
>>>>>>> 51bc1e1d31230683fb665d3668dcecd8796ca3ad
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

<<<<<<< HEAD
  return res.status(500).render('error', {
    pageTitle: 'Server Error',
    message: 'Something went wrong while processing your request.'
  });
});

module.exports = app;
=======
  return res.status(500).send('Internal server Error');
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
>>>>>>> 51bc1e1d31230683fb665d3668dcecd8796ca3ad
