const { getBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/book.controller');

const router = require('express').Router();

// Gợi ý: khi làm phân quyền, thêm middleware vào route, ví dụ:
// const { verifyToken, authorize } = require('../middlewares/auth.middleware');
// router.post('/', verifyToken, authorize('admin', 'librarian'), createBook);

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

module.exports = router;
