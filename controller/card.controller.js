const Board = require('../models/board');
const List = require('../models/list');
const Card = require('../models/card');
const { renderBoardPage } = require('./render-helpers');
const {
  normalizeOptionalText,
  normalizeText,
  validateText,
  VALIDATION_LIMITS,
  parseMembers,
  validateMembers,
  parseSubtasks,
  validateSubtasks,
  isValidDateInput
} = require('../lib/validation');

async function findBoardByList(userId, listId) {
  const list = await List.findById(listId);

  if (!list) {
    return {};
  }

  const board = await Board.findOne({ _id: list.boardId, userId });
  return { list, board };
}

async function findCardContext(userId, cardId) {
  const card = await Card.findById(cardId);

  if (!card) {
    return {};
  }

  const list = await List.findById(card.listId);

  if (!list) {
    return { card };
  }

  const board = await Board.findOne({ _id: list.boardId, userId });
  return { card, list, board };
}

async function createCard(req, res, next) {
  try {
    const { list, board } = await findBoardByList(req.session.userId, req.params.listId);

    if (!list || !board) {
      return res.redirect('/boards');
    }

    const title = normalizeText(req.body.title);
    const type = req.body.type === 'group' ? 'group' : 'personal';
    const description = normalizeOptionalText(req.body.description);
    const dueDate = req.body.dueDate || '';
    const groupName = normalizeText(req.body.groupName);
    const members = parseMembers(req.body.members);
    const subtasks = parseSubtasks(req.body.subtasksText);

    if (!title) {
      return await renderBoardPage(req, res, board._id, 'Task title is required.');
    }

    const titleError = validateText(title, VALIDATION_LIMITS.cardTitle);

    if (titleError) {
      return await renderBoardPage(req, res, board._id, titleError);
    }

    const descriptionError = validateText(description, VALIDATION_LIMITS.cardDescription, { required: false });

    if (descriptionError) {
      return await renderBoardPage(req, res, board._id, descriptionError);
    }

    if (!isValidDateInput(dueDate)) {
      return await renderBoardPage(req, res, board._id, 'Please enter a valid due date.');
    }

    if (type === 'group') {
      const groupNameError = validateText(groupName, VALIDATION_LIMITS.groupName);

      if (groupNameError) {
        return await renderBoardPage(req, res, board._id, groupNameError);
      }

      if (!subtasks.length) {
        return await renderBoardPage(req, res, board._id, 'Add at least one subtask for a group project.');
      }

      const membersError = validateMembers(members);

      if (membersError) {
        return await renderBoardPage(req, res, board._id, membersError);
      }

      const subtasksError = validateSubtasks(subtasks);

      if (subtasksError) {
        return await renderBoardPage(req, res, board._id, subtasksError);
      }
    }

    await Card.create({
      title,
      description,
      dueDate: dueDate || null,
      listId: list._id,
      type,
      groupName: type === 'group' ? groupName : '',
      members: type === 'group' ? members : [],
      subtasks: type === 'group' ? subtasks : []
    });

    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

async function editCard(req, res, next) {
  try {
    const { card, board } = await findCardContext(req.session.userId, req.params.id);

    if (!card || !board) {
      return res.redirect('/boards');
    }

    const title = normalizeText(req.body.title);
    const description = normalizeOptionalText(req.body.description);
    const dueDate = req.body.dueDate || '';
    const type = req.body.type === 'group' ? 'group' : 'personal';
    const groupName = normalizeText(req.body.groupName);
    const members = parseMembers(req.body.members);

    if (!title) {
      return await renderBoardPage(req, res, board._id, 'Task title is required.');
    }

    const titleError = validateText(title, VALIDATION_LIMITS.cardTitle);

    if (titleError) {
      return await renderBoardPage(req, res, board._id, titleError);
    }

    const descriptionError = validateText(description, VALIDATION_LIMITS.cardDescription, { required: false });

    if (descriptionError) {
      return await renderBoardPage(req, res, board._id, descriptionError);
    }

    if (!isValidDateInput(dueDate)) {
      return await renderBoardPage(req, res, board._id, 'Please enter a valid due date.');
    }

    if (type === 'group') {
      const groupNameError = validateText(groupName, VALIDATION_LIMITS.groupName);

      if (groupNameError) {
        return await renderBoardPage(req, res, board._id, groupNameError);
      }

      const membersError = validateMembers(members);

      if (membersError) {
        return await renderBoardPage(req, res, board._id, membersError);
      }
    }

    card.title = title;
    card.description = description;
    card.dueDate = dueDate || null;
    card.type = type;
    card.groupName = type === 'group' ? groupName : '';
    card.members = type === 'group' ? members : [];

    if (type === 'personal') {
      card.subtasks = [];
    } else if (!card.subtasks.length) {
      return await renderBoardPage(req, res, board._id, 'Group projects must keep at least one subtask.');
    }

    await card.save();

    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

async function deleteCard(req, res, next) {
  try {
    const { card, board } = await findCardContext(req.session.userId, req.params.id);

    if (!card || !board) {
      return res.redirect('/boards');
    }

    await Card.deleteOne({ _id: card._id });
    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

async function moveCard(req, res, next) {
  try {
    const { card, list, board } = await findCardContext(req.session.userId, req.params.id);

    if (!card || !list || !board) {
      return res.redirect('/boards');
    }

    const destinationList = await List.findById(req.body.listId);

    if (!destinationList || String(destinationList.boardId) !== String(board._id)) {
      return await renderBoardPage(req, res, board._id, 'Please choose a list from this board.');
    }

    card.listId = destinationList._id;
    await card.save();

    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

async function addSubtask(req, res, next) {
  try {
    const { card, board } = await findCardContext(req.session.userId, req.params.cardId);

    if (!card || !board || card.type !== 'group') {
      return res.redirect('/boards');
    }

    const title = normalizeText(req.body.title);

    if (!title) {
      return await renderBoardPage(req, res, board._id, 'Subtask title is required.');
    }

    const titleError = validateText(title, VALIDATION_LIMITS.subtaskTitle);

    if (titleError) {
      return await renderBoardPage(req, res, board._id, titleError);
    }

    if (card.subtasks.length >= VALIDATION_LIMITS.subtaskCount.max) {
      return await renderBoardPage(
        req,
        res,
        board._id,
        `You can add up to ${VALIDATION_LIMITS.subtaskCount.max} subtasks only.`
      );
    }

    card.subtasks.push({ title });
    await card.save();

    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

async function toggleSubtask(req, res, next) {
  try {
    const { card, board } = await findCardContext(req.session.userId, req.params.cardId);

    if (!card || !board || card.type !== 'group') {
      return res.redirect('/boards');
    }

    const subtask = card.subtasks.id(req.params.subtaskId);

    if (!subtask) {
      return res.redirect(`/boards/${board._id}`);
    }

    subtask.isDone = !subtask.isDone;
    await card.save();

    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

async function deleteSubtask(req, res, next) {
  try {
    const { card, board } = await findCardContext(req.session.userId, req.params.cardId);

    if (!card || !board || card.type !== 'group') {
      return res.redirect('/boards');
    }

    if (card.subtasks.length === 1) {
      return await renderBoardPage(req, res, board._id, 'A group project must keep at least one subtask.');
    }

    card.subtasks.pull({ _id: req.params.subtaskId });
    await card.save();

    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createCard,
  editCard,
  deleteCard,
  moveCard,
  addSubtask,
  toggleSubtask,
  deleteSubtask
};
