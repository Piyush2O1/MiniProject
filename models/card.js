const mongoose = require('mongoose');
const { VALIDATION_LIMITS } = require('../lib/validation');

const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: VALIDATION_LIMITS.subtaskTitle.max
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
      trim: true,
      maxlength: VALIDATION_LIMITS.cardTitle.max
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: VALIDATION_LIMITS.cardDescription.max
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
      default: '',
      maxlength: VALIDATION_LIMITS.groupName.max
    },
    members: [
      {
        type: String,
        trim: true,
        maxlength: VALIDATION_LIMITS.memberName.max
      }
    ],
    subtasks: [subtaskSchema]
  },
  {
    timestamps: true
  }
);

cardSchema.path('members').validate(
  (members) => members.length <= VALIDATION_LIMITS.memberCount.max,
  `You can add up to ${VALIDATION_LIMITS.memberCount.max} members only.`
);

cardSchema.path('subtasks').validate(
  (subtasks) => subtasks.length <= VALIDATION_LIMITS.subtaskCount.max,
  `You can add up to ${VALIDATION_LIMITS.subtaskCount.max} subtasks only.`
);

module.exports = mongoose.model('Card', cardSchema);
