const bcrypt = require('bcryptjs');

const User = require('../models/user');

function showLogin(req, res) {
  if (req.session.userId) {
    return res.redirect('/boards');
  }

  return res.render('login', {
    pageTitle: 'Login',
    error: null
  });
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('login', {
        pageTitle: 'Login',
        error: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(400).render('login', {
        pageTitle: 'Login',
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).render('login', {
        pageTitle: 'Login',
        error: 'Invalid email or password.'
      });
    }

    req.session.userId = user._id;
    return req.session.save(() => res.redirect('/boards'));
  } catch (error) {
    return next(error);
  }
}

function showSignup(req, res) {
  if (req.session.userId) {
    return res.redirect('/boards');
  }

  return res.render('signup', {
    pageTitle: 'Sign Up',
    error: null
  });
}

async function signupUser(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).render('signup', {
        pageTitle: 'Sign Up',
        error: 'Username, email, and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).render('signup', {
        pageTitle: 'Sign Up',
        error: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    req.session.userId = user._id;
    return req.session.save(() => res.redirect('/boards'));
  } catch (error) {
    return next(error);
  }
}

function logoutUser(req, res) {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
}

module.exports = {
  showLogin,
  loginUser,
  showSignup,
  signupUser,
  logoutUser
};
