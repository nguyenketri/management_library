const {
    getCards,
    getMyCard,
    getCardById,
    createCard,
    updateCardStatus,
    renewCard,
} = require('../controllers/card.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = require('express').Router();

// Quy tắc: thẻ thư viện là nghiệp vụ của THỦ THƯ
const librarian = authorize('librarian');

// Tất cả route bên dưới đều phải đăng nhập
router.use(verifyToken);

// Thẻ của chính mình (độc giả) - khai báo TRƯỚC '/:id'
router.get('/me', getMyCard);

// Quản lý thẻ: chỉ thủ thư
router.get('/', librarian, getCards);
router.get('/:id', librarian, getCardById);
router.post('/', librarian, createCard);
router.patch('/:id/status', librarian, updateCardStatus);
router.patch('/:id/renew', librarian, renewCard);

module.exports = router;
