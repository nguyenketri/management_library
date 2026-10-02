const express = require('express');
const router = express.Router();
const {
    getBorrowRecords,
    getMyBorrows,
    getBorrowHistory,
    extendBorrow,
    getMyPenalties,
    borrowBook,
    returnBook,
} = require('../controllers/borrowController');

// Routes quản lý mượn trả
router.get('/', getBorrowRecords);             // Lấy danh sách phiếu mượn
router.get('/my-borrows', getMyBorrows);       // Sách đang mượn của bạn đọc
router.get('/my-history', getBorrowHistory);   // Lịch sử mượn của bạn đọc
router.get('/my-penalties', getMyPenalties);   // Tiền phạt của bạn đọc
router.put('/extend/:id', extendBorrow);       // Gia hạn sách
router.post('/', borrowBook);                  // Mượn sách
router.put('/:id/return', returnBook);         // Trả sách

module.exports = router;
