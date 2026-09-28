const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');

// Định nghĩa các Routes CRUD cho Book
router.get('/', getBooks);            // Lấy danh sách sách
router.get('/:id', getBookById);      // Lấy chi tiết sách theo id
router.post('/', createBook);         // Tạo sách mới
router.put('/:id', updateBook);       // Cập nhật sách theo id
router.delete('/:id', deleteBook);    // Xóa sách theo id

module.exports = router;
