const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getBookReport,
  getReaderReport,
  getBorrowReport,
  getOverdueReport,
} = require('../controllers/reportController');

// Routes báo cáo cho Quản lý thư viện (chỉ đọc)
router.get('/dashboard', getDashboard);       // Tổng quan
router.get('/books', getBookReport);          // Báo cáo sách
router.get('/readers', getReaderReport);      // Báo cáo bạn đọc
router.get('/borrows', getBorrowReport);      // Báo cáo mượn/trả
router.get('/overdue', getOverdueReport);     // Báo cáo quá hạn

module.exports = router;
