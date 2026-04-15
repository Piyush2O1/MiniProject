const mongoose = require('mongoose');
const { VALIDATION_LIMITS } = require('../lib/validation');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: VALIDATION_LIMITS.username.min,
      maxlength: VALIDATION_LIMITS.username.max
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: VALIDATION_LIMITS.email.max
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.path('email').validate((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Please enter a valid email address.');

module.exports = mongoose.model('User', userSchema);
