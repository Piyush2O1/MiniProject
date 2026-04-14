//card.js
const express = require('express');
const {
  createCard,
  editCard,
  deleteCard,
  moveCard,
  addSubtask,
  toggleSubtask,
  deleteSubtask
} = require('../controller/card.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/:listId', createCard);
router.post('/edit/:id', editCard);
router.post('/delete/:id', deleteCard);
router.post('/move/:id', moveCard);
router.post('/subtasks/:cardId', addSubtask);
router.post('/subtasks/:cardId/:subtaskId/toggle', toggleSubtask);
router.post('/subtasks/:cardId/:subtaskId/delete', deleteSubtask);

module.exports = router;