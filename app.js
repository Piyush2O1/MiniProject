const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');

const { connectToDatabase } = require('./lib/database');
const { VALIDATION_LIMITS } = require('./lib/validation');
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/board');
const listRoutes = require('./routes/list');
const cardRoutes = require('./routes/card');

dotenv.config();

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
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};
app.locals.validationLimits = VALIDATION_LIMITS;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.currentUserId = null;
  next();
});

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
  return res.status(404).render('error', {
    pageTitle: 'Page Not Found',
    message: 'The page you requested could not be found.'
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).render('error', {
    pageTitle: 'Server Error',
    message: 'Something went wrong while processing your request.'
  });
});

module.exports = app;
