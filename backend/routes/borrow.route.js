const { getBorrows, borrowBook, returnBook } = require('../controllers/borrow.controller');

const router = require('express').Router();

router.get('/', getBorrows);
router.post('/', borrowBook);
router.put('/:id/return', returnBook);

module.exports = router;
