const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    isDone: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: true
  }
);

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    dueDate: {
      type: Date,
      default: null
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true
    },
    type: {
      type: String,
      enum: ['personal', 'group'],
      default: 'personal'
    },
    groupName: {
      type: String,
      trim: true,
      default: ''
    },
    members: [
      {
        type: String,
        trim: true
      }
    ],
    subtasks: [subtaskSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Card', cardSchema);
