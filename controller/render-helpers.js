const Board = require('../models/board');
const List = require('../models/list');
const Card = require('../models/card');

async function buildBoardViewModel(userId, boardId) {
  const board = await Board.findOne({ _id: boardId, userId }).lean();

  if (!board) {
    return null;
  }

  const lists = await List.find({ boardId: board._id }).sort({ createdAt: 1 }).lean();
  const listIds = lists.map((list) => list._id);
  const cards = await Card.find({ listId: { $in: listIds } }).sort({ createdAt: 1 }).lean();

  return {
    board,
    lists: lists.map((list) => ({
      ...list,
      cards: cards.filter((card) => String(card.listId) === String(list._id))
    }))
  };
}

async function renderDashboard(res, userId, error = null) {
  const boards = await Board.find({ userId }).sort({ createdAt: -1 }).lean();

  return res.render('dashboard', {
    pageTitle: 'Dashboard',
    boards,
    error
  });
}

async function renderBoardPage(req, res, boardId, error = null) {
  const model = await buildBoardViewModel(req.session.userId, boardId);

  if (!model) {
    return res.status(404).render('error', {
      pageTitle: 'Board Not Found',
      message: 'Board not found or access denied.'
    });
  }

  return res.render('board-view', {
    pageTitle: model.board.title,
    board: model.board,
    lists: model.lists,
    error
  });
}

module.exports = {
  renderDashboard,
  renderBoardPage
};
