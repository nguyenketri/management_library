const express = require('express');
const router = express.Router();
const { getBorrowRecords, borrowBook, returnBook } = require('../controllers/borrowController');

// Routes quản lý mượn trả
router.get('/', getBorrowRecords);             // Lấy danh sách phiếu mượn
router.post('/', borrowBook);                  // Mượn sách
router.put('/:id/return', returnBook);         // Trả sách

module.exports = router;
