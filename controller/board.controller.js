const Board = require('../models/board');
const List = require('../models/list');
const Card = require('../models/card');
const { renderDashboard, renderBoardPage } = require('./render-helpers');
const { normalizeText, validateText, VALIDATION_LIMITS } = require('../lib/validation');

async function showDashboard(req, res, next) {
  try {
    return await renderDashboard(res, req.session.userId);
  } catch (error) {
    return next(error);
  }
}

async function createBoard(req, res, next) {
  try {
    const title = normalizeText(req.body.title);

    if (!title) {
      return await renderDashboard(res, req.session.userId, 'Board title is required.');
    }

    const titleError = validateText(title, VALIDATION_LIMITS.boardTitle);

    if (titleError) {
      return await renderDashboard(res, req.session.userId, titleError);
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
    return await renderBoardPage(req, res, req.params.id);
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
