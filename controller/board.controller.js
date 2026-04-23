const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');

async function renderDashboard(res, userId, error = null) {
  const boards = await Board.find({ userId }).sort({ createdAt: -1 }).lean();

  return res.render('dashboard', {
    pageTitle: 'Dashboard',
    boards,
    error
  });
}

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

async function showDashboard(req, res, next) {
  try {
    return renderDashboard(res, req.session.userId);
  } catch (error) {
    return next(error);
  }
}

async function createBoard(req, res, next) {
  try {
    const title = req.body.title ? req.body.title.trim() : '';

    if (!title) {
      return renderDashboard(res, req.session.userId, 'Board title is required.');
    }

    const board = await Board.create({
      title,
      userId: req.session.userId
    });

    await List.insertMany([
      { title: 'To Do', boardId: board._id },
      { title: 'Doing', boardId: board._id },
      { title: 'Done', boardId: board._id }
    ]);

    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

async function showBoard(req, res, next) {
  try {
    return renderBoardPage(req, res, req.params.id);
  } catch (error) {
    return next(error);
  }
}

async function deleteBoard(req, res, next) {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.session.userId });

    if (!board) {
      return res.redirect('/boards');
    }

    const lists = await List.find({ boardId: board._id }).select('_id');
    const listIds = lists.map((list) => list._id);

    await Card.deleteMany({ listId: { $in: listIds } });
    await List.deleteMany({ boardId: board._id });
    await Board.deleteOne({ _id: board._id });

    return res.redirect('/boards');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showDashboard,
  createBoard,
  showBoard,
  deleteBoard
};