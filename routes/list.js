//list.js
const express = require('express');
const {
  createList,
  editList,
  deleteList
} = require('../controller/list.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/:boardId', createList);
router.post('/:id/edit', editList);
router.post('/:id/delete', deleteList);

module.exports = router;