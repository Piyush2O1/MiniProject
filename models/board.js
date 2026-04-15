const mongoose = require('mongoose');
const { VALIDATION_LIMITS } = require('../lib/validation');

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: VALIDATION_LIMITS.boardTitle.max
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Board', boardSchema);
