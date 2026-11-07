const express = require('express');
const router = express.Router();

// Import các routes con
const bookRoutes = require('./bookRoutes');
const userRoutes = require('./userRoutes');
const borrowRoutes = require('./borrowRoutes');
const reportRoutes = require('./reportRoutes');

// Endpoint kiểm tra trạng thái hoạt động: GET /api/health
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Library Management API is running',
    timestamp: new Date().toISOString(),
  });
});

// Gắn các tài nguyên vào router trung gian
const authRoutes = require('./authRoutes');

router.use('/auth', authRoutes);         // Đăng ký / Đăng nhập: /api/auth
router.use('/books', bookRoutes);       // Quản lý sách: /api/books
router.use('/users', userRoutes);       // Quản lý 5 thành viên: /api/users
router.use('/borrows', borrowRoutes);   // Quản lý mượn/trả: /api/borrows
router.use('/reports', reportRoutes);   // Báo cáo cho Quản lý: /api/reports

module.exports = router;
