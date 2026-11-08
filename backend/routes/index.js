const router = require('express').Router();

// Đã đăng ký sẵn route cho tất cả module -> mỗi người chỉ sửa file của mình, không cần sửa file này
router.use('/auth', require('./auth.route'));           // Đăng nhập / đăng ký     - Phần xác thực
router.use('/users', require('./user.route'));          // Quản lý thành viên      - Người 1
router.use('/books', require('./book.route'));          // Quản lý sách            - Người 2
router.use('/categories', require('./category.route')); // Danh mục sách           - Người 2
router.use('/cards', require('./card.route'));          // Thẻ thư viện            - Người 1
router.use('/reviews', require('./review.route'));      // Đánh giá sách           - Người 2
router.use('/borrows', require('./borrow.route'));      // Mượn / trả sách         - Người 3
router.use('/reports', require('./report.route'));      // Báo cáo cho Quản lý     - Người 3

module.exports = router;
