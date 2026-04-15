const VALIDATION_LIMITS = Object.freeze({
  username: Object.freeze({ min: 3, max: 20, label: 'Username' }),
  email: Object.freeze({ max: 120, label: 'Email' }),
  password: Object.freeze({ min: 6, max: 20, label: 'Password' }),
  boardTitle: Object.freeze({ max: 40, label: 'Board title' }),
  listTitle: Object.freeze({ max: 30, label: 'List title' }),
  cardTitle: Object.freeze({ max: 80, label: 'Task title' }),
  cardDescription: Object.freeze({ max: 300, label: 'Description' }),
  groupName: Object.freeze({ max: 40, label: 'Group name' }),
  memberName: Object.freeze({ max: 30, label: 'Member name' }),
  memberCount: Object.freeze({ max: 10, label: 'Members' }),
  membersInput: Object.freeze({ max: 340, label: 'Members' }),
  subtaskTitle: Object.freeze({ max: 60, label: 'Subtask title' }),
  subtaskCount: Object.freeze({ max: 20, label: 'Subtasks' }),
  subtasksInput: Object.freeze({ max: 1240, label: 'Subtasks' })
});

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateText(value, config, options = {}) {
  const normalizedValue = normalizeText(value);
  const isRequired = options.required !== false;

  if (isRequired && !normalizedValue) {
    return `${config.label} is required.`;
  }

  if (!normalizedValue) {
    return null;
  }

  if (config.min && normalizedValue.length < config.min) {
    return `${config.label} must be at least ${config.min} characters long.`;
  }

  if (config.max && normalizedValue.length > config.max) {
    return `${config.label} must be ${config.max} characters or fewer.`;
  }

  return null;
}

function validateEmail(value) {
  const normalizedValue = normalizeText(value).toLowerCase();

  if (!normalizedValue) {
    return 'Email is required.';
  }

  if (normalizedValue.length > VALIDATION_LIMITS.email.max) {
    return `Email must be ${VALIDATION_LIMITS.email.max} characters or fewer.`;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedValue)) {
    return 'Please enter a valid email address.';
  }

  return null;
}

function validatePassword(value, options = {}) {
  const password = typeof value === 'string' ? value : '';
  const isRequired = options.required !== false;
  const enforceMinLength = options.enforceMinLength !== false;

  if (isRequired && !password) {
    return 'Password is required.';
  }

  if (!password) {
    return null;
  }

  if (enforceMinLength && password.length < VALIDATION_LIMITS.password.min) {
    return `Password must be at least ${VALIDATION_LIMITS.password.min} characters long.`;
  }

  if (password.length > VALIDATION_LIMITS.password.max) {
    return `Password must be ${VALIDATION_LIMITS.password.max} characters or fewer.`;
  }

  return null;
}

function parseMembers(membersText) {
  return (membersText || '')
    .split(',')
    .map((member) => normalizeText(member))
    .filter(Boolean);
}

function validateMembers(members) {
  if (members.length > VALIDATION_LIMITS.memberCount.max) {
    return `You can add up to ${VALIDATION_LIMITS.memberCount.max} members only.`;
  }

  for (const member of members) {
    const error = validateText(member, VALIDATION_LIMITS.memberName);

    if (error) {
      return error;
    }
  }

  return null;
}

function parseSubtasks(subtasksText) {
  return (subtasksText || '')
    .split(/\r?\n/)
    .map((subtask) => normalizeText(subtask))
    .filter(Boolean)
    .map((title) => ({ title }));
}

function validateSubtasks(subtasks) {
  if (subtasks.length > VALIDATION_LIMITS.subtaskCount.max) {
    return `You can add up to ${VALIDATION_LIMITS.subtaskCount.max} subtasks only.`;
  }

  for (const subtask of subtasks) {
    const error = validateText(subtask.title, VALIDATION_LIMITS.subtaskTitle);

    if (error) {
      return error;
    }
  }

  return null;
}

function normalizeOptionalText(value) {
  return normalizeText(value);
}

function isValidDateInput(value) {
  if (!value) {
    return true;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

module.exports = {
  VALIDATION_LIMITS,
  normalizeOptionalText,
  normalizeText,
  validateText,
  validateEmail,
  validatePassword,
  parseMembers,
  validateMembers,
  parseSubtasks,
  validateSubtasks,
  isValidDateInput
};
