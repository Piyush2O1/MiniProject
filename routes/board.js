const express = require('express');
const {
  showDashboard,
  createBoard,
  showBoard,
  deleteBoard
} = require('../Controller/board.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', showDashboard);
router.post('/', createBoard);
router.get('/:id', showBoard);
router.post('/:id/delete', deleteBoard);

module.exports = router;
