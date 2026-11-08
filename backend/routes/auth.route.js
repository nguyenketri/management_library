const { login, register, getProfile, changePassword } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = require('express').Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', verifyToken, getProfile);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
