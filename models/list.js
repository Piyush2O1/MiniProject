const mongoose = require('mongoose');
const { VALIDATION_LIMITS } = require('../lib/validation');

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: VALIDATION_LIMITS.listTitle.max
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('List', listSchema);
