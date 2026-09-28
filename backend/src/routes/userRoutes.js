const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser } = require('../controllers/userController');

// Routes quản lý người dùng / độc giả
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

module.exports = router;
