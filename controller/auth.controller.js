const bcrypt = require('bcrypt');
const User = require('../models/user');

function renderLogin(req, res, error = null) {
  return res.render('login', {
    pageTitle: 'Login',
    error
  });
}

function renderSignup(req, res, error = null) {
  return res.render('signup', {
    pageTitle: 'Sign Up',
    error
  });
}

async function showLogin(req, res) {
  return renderLogin(req, res);
}

async function showSignup(req, res) {
  return renderSignup(req, res);
}

async function loginUser(req, res, next) {
  try {
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password || '';

    if (!email || !password) {
      return renderLogin(req, res, 'Email and password are required.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return renderLogin(req, res, 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return renderLogin(req, res, 'Invalid email or password.');
    }

    req.session.userId = user._id;
    return res.redirect('/boards');
  } catch (error) {
    return next(error);
  }
}

async function signupUser(req, res, next) {
  try {
    const username = req.body.username ? req.body.username.trim() : '';
    const email = req.body.email ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password || '';

    if (!username || !email || !password) {
      return renderSignup(req, res, 'Username, email, and password are required.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return renderSignup(req, res, 'An account with that email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    req.session.userId = user._id;
    return res.redirect('/boards');
  } catch (error) {
    return next(error);
  }
}

function logoutUser(req, res, next) {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.clearCookie('connect.sid');
    return res.redirect('/auth/login');
  });
}

module.exports = {
  showLogin,
  loginUser,
  showSignup,
  signupUser,
  logoutUser
};
