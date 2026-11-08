const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// [GET] /api/users?role=member (admin, librarian)
exports.getUsers = async (req, resp, next) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};

        const users = await User.find(filter).select('-password -__v').sort({ createdAt: 1 });
        return resp.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// [GET] /api/users/:id (admin, librarian)
exports.getUserById = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid userId: ${id}` });
        }

        const user = await User.findById(id).select('-password -__v');
        if (!user) {
            return resp.status(404).json({ error: `User with id = ${id} not found` });
        }

        return resp.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// [POST] /api/users (admin) - tạo tài khoản với role bất kỳ
exports.createUser = async (req, resp, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email) {
            return resp.status(400).json({ error: 'name and email are required' });
        }
        if (role && !User.ROLES.includes(role)) {
            return resp.status(400).json({ error: `Invalid role: ${role}` });
        }

        const user = await User.create({
            ...req.body,
            password: await bcrypt.hash(password || 'password123', 10),
        });

        const result = user.toObject();
        delete result.password;
        return resp.status(201).json(result);
    } catch (error) {
        next(error);
    }
};
