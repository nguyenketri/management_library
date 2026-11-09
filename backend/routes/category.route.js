// routes/category.route.js - Quản lý danh mục sách
// Người phụ trách: Người 2
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/category.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = require('express').Router();

const librarian = authorize('librarian');

// Lấy danh sách danh mục (công khai để tra cứu sách / lọc)
router.get('/', getCategories);

// Thao tác quản trị danh mục: bắt buộc đăng nhập và là Thủ thư
router.post('/', verifyToken, librarian, createCategory);
router.put('/:id', verifyToken, librarian, updateCategory);
router.delete('/:id', verifyToken, librarian, deleteCategory);

module.exports = router;
