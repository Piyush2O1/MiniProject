const bcrypt = require('bcryptjs');

const User = require('../models/user');
const {
  normalizeText,
  validateEmail,
  validatePassword,
  validateText,
  VALIDATION_LIMITS
} = require('../lib/validation');

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
    const email = normalizeText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).render('login', {
        pageTitle: 'Login',
        error: 'Email and password are required.'
      });
    }

    const emailError = validateEmail(email);

    if (emailError) {
      return res.status(400).render('login', {
        pageTitle: 'Login',
        error: emailError
      });
    }

    const passwordError = validatePassword(password, { enforceMinLength: false });

    if (passwordError) {
      return res.status(400).render('login', {
        pageTitle: 'Login',
        error: passwordError
      });
    }

    const user = await User.findOne({ email });

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
    const username = normalizeText(req.body.username);
    const email = normalizeText(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!username || !email || !password) {
      return res.status(400).render('signup', {
        pageTitle: 'Sign Up',
        error: 'Username, email, and password are required.'
      });
    }

    const usernameError = validateText(username, VALIDATION_LIMITS.username);

    if (usernameError) {
      return res.status(400).render('signup', {
        pageTitle: 'Sign Up',
        error: usernameError
      });
    }

    const emailError = validateEmail(email);

    if (emailError) {
      return res.status(400).render('signup', {
        pageTitle: 'Sign Up',
        error: emailError
      });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).render('signup', {
        pageTitle: 'Sign Up',
        error: passwordError
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).render('signup', {
        pageTitle: 'Sign Up',
        error: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
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
