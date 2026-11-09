// routes/review.route.js - Quản lý đánh giá sách
// Người phụ trách: Người 2
const {
    getReviews,
    createReview,
    deleteReview,
} = require('../controllers/review.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = require('express').Router();

// Xem đánh giá: công khai
router.get('/', getReviews);

// Viết đánh giá: bắt buộc đăng nhập và là Độc giả (member)
router.post('/', verifyToken, authorize('member'), createReview);

// Xóa đánh giá: bắt buộc đăng nhập (chính chủ hoặc admin/librarian)
router.delete('/:id', verifyToken, deleteReview);

module.exports = router;
