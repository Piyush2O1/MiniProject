const express = require('express');
const {
  showLogin,
  loginUser,
  showSignup,
  signupUser,
  logoutUser
} = require('../Controller/auth.controller');

const router = express.Router();

router.get('/login', showLogin);
router.post('/login', loginUser);
router.get('/signup', showSignup);
router.post('/signup', signupUser);
router.post('/logout', logoutUser);

module.exports = router;
