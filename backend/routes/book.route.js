// routes/book.route.js - Quản lý kho sách
// Người phụ trách: Người 2
const {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
} = require('../controllers/book.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = require('express').Router();

const librarian = authorize('librarian');

// Xem sách: công khai (khách xem landing/tra cứu, độc giả, quản lý)
router.get('/', getBooks);
router.get('/:id', getBookById);

// Thao tác sửa đổi kho sách: chỉ Thủ thư
router.post('/', verifyToken, librarian, createBook);
router.put('/:id', verifyToken, librarian, updateBook);
router.delete('/:id', verifyToken, librarian, deleteBook);

module.exports = router;
