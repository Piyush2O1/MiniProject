//card.controller.js

const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');

async function renderBoardPage(req, res, boardId, error = null) {
  const board = await Board.findOne({ _id: boardId, userId: req.session.userId }).lean();

  if (!board) {
    return res.status(404).render('board-view', {
      pageTitle: 'Board Not Found',
      board: null,
      lists: [],
      error: 'Board not found or access denied.'
    });
  }

  const lists = await List.find({ boardId: board._id }).sort({ createdAt: 1 }).lean();
  const listIds = lists.map((list) => list._id);
  const cards = await Card.find({ listId: { $in: listIds } }).sort({ createdAt: 1 }).lean();

  const listsWithCards = lists.map((list) => ({
    ...list,
    cards: cards.filter((card) => String(card.listId) === String(list._id))
  }));

  return res.render('board-view', {
    pageTitle: board.title,
    board,
    lists: listsWithCards,
    error
  });
}

function parseMembers(membersText) {
  return (membersText || '')
    .split(',')
    .map((member) => member.trim())
    .filter(Boolean);
}

function parseSubtasks(subtasksText) {
  return (subtasksText || '')
    .split(/\r?\n/)
    .map((subtask) => subtask.trim())
    .filter(Boolean)
    .map((title) => ({ title }));
}

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

    const title = req.body.title ? req.body.title.trim() : '';
    const type = req.body.type === 'group' ? 'group' : 'personal';
    const description = req.body.description ? req.body.description.trim() : '';
    const dueDate = req.body.dueDate || '';
    const groupName = req.body.groupName ? req.body.groupName.trim() : '';
    const members = parseMembers(req.body.members);
    const subtasks = parseSubtasks(req.body.subtasksText);

    if (!title) {
      return renderBoardPage(req, res, board._id, 'Task title is required.');
    }

    if (type === 'group') {
      if (!groupName) {
        return renderBoardPage(req, res, board._id, 'Group name is required for a group project.');
      }

      if (!subtasks.length) {
        return renderBoardPage(req, res, board._id, 'Add at least one subtask for a group project.');
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

    const title = req.body.title ? req.body.title.trim() : '';
    const description = req.body.description ? req.body.description.trim() : '';
    const dueDate = req.body.dueDate || '';
    const type = req.body.type === 'group' ? 'group' : 'personal';
    const groupName = req.body.groupName ? req.body.groupName.trim() : '';
    const members = parseMembers(req.body.members);

    if (!title) {
      return renderBoardPage(req, res, board._id, 'Task title is required.');
    }

    if (type === 'group' && !groupName) {
      return renderBoardPage(req, res, board._id, 'Group name is required for a group project.');
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
      return renderBoardPage(req, res, board._id, 'Group projects must keep at least one subtask.');
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
      return renderBoardPage(req, res, board._id, 'Please choose a list from this board.');
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

    const title = req.body.title ? req.body.title.trim() : '';

    if (!title) {
      return renderBoardPage(req, res, board._id, 'Subtask title is required.');
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
      return renderBoardPage(req, res, board._id, 'A group project must keep at least one subtask.');
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

