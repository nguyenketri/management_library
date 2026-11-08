const {
    getUsers,
    getUserById,
    createUser,
    updateUserRole,
    updateUserStatus,
    getMe,
    updateMe,
} = require('../controllers/user.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = require('express').Router();

// Tất cả route bên dưới đều phải đăng nhập
router.use(verifyToken);

// Hồ sơ của chính mình: chỉ chủ tài khoản được sửa thông tin cá nhân - khai báo TRƯỚC '/:id'
router.get('/me', getMe);
router.put('/me', updateMe);

// Danh sách: admin xem tất cả, thủ thư chỉ thấy độc giả (để lập phiếu mượn, cấp thẻ)
router.get('/', authorize('admin', 'librarian'), getUsers);

// Quản trị tài khoản: chỉ admin (tạo tài khoản, đổi vai trò, khóa / mở - KHÔNG sửa thông tin cá nhân)
router.get('/:id', authorize('admin'), getUserById);
router.post('/', authorize('admin'), createUser);
router.patch('/:id/role', authorize('admin'), updateUserRole);
router.patch('/:id/status', authorize('admin'), updateUserStatus);

module.exports = router;
