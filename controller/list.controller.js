const Board = require('../models/board');
const List = require('../models/list');
const Card = require('../models/card');
const { renderBoardPage } = require('./render-helpers');
const { normalizeText, validateText, VALIDATION_LIMITS } = require('../lib/validation');

async function createList(req, res, next) {
  try {
    const title = normalizeText(req.body.title);
    const board = await Board.findOne({ _id: req.params.boardId, userId: req.session.userId });

    if (!board) {
      return res.redirect('/boards');
    }

    if (!title) {
      return await renderBoardPage(req, res, board._id, 'List title is required.');
    }

    const titleError = validateText(title, VALIDATION_LIMITS.listTitle);

    if (titleError) {
      return await renderBoardPage(req, res, board._id, titleError);
    }

    await List.create({
      title,
      boardId: board._id
    });

    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

async function editList(req, res, next) {
  try {
    const title = normalizeText(req.body.title);
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.redirect('/boards');
    }

    const board = await Board.findOne({ _id: list.boardId, userId: req.session.userId });

    if (!board) {
      return res.redirect('/boards');
    }

    if (!title) {
      return await renderBoardPage(req, res, board._id, 'List title is required.');
    }

    const titleError = validateText(title, VALIDATION_LIMITS.listTitle);

    if (titleError) {
      return await renderBoardPage(req, res, board._id, titleError);
    }

    list.title = title;
    await list.save();

    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

async function deleteList(req, res, next) {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.redirect('/boards');
    }

    const board = await Board.findOne({ _id: list.boardId, userId: req.session.userId });

    if (!board) {
      return res.redirect('/boards');
    }

    await Card.deleteMany({ listId: list._id });
    await List.deleteOne({ _id: list._id });

    return res.redirect(`/boards/${board._id}`);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createList,
  editList,
  deleteList
};
