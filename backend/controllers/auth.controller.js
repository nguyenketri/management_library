const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Tạo JWT chứa id, role, name -> middleware verifyToken giải mã ra req.user
const signToken = (user) => jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
);

// Bỏ password trước khi trả về client
const toSafeUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    studentId: user.studentId,
});

// [POST] /api/auth/login
exports.login = async (req, resp, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return resp.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return resp.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return resp.status(401).json({ error: 'Invalid email or password' });
        }

        return resp.status(200).json({
            token: signToken(user),
            user: toSafeUser(user),
        });
    } catch (error) {
        next(error);
    }
};

// [POST] /api/auth/register - đăng ký luôn là độc giả (member)
exports.register = async (req, resp, next) => {
    try {
        const { name, email, password, phone, studentId } = req.body;

        if (!name || !email || !password) {
            return resp.status(400).json({ error: 'Name, email and password are required' });
        }

        const existed = await User.findOne({ email: email.toLowerCase().trim() });
        if (existed) {
            return resp.status(400).json({ error: `Email ${email} đã được sử dụng` });
        }

        const user = await User.create({
            name,
            email,
            password: await bcrypt.hash(password, 10),
            role: 'member',
            phone,
            studentId,
        });

        return resp.status(201).json({
            token: signToken(user),
            user: toSafeUser(user),
        });
    } catch (error) {
        next(error);
    }
};

// [GET] /api/auth/me - thông tin user đang đăng nhập (cần token)
exports.getProfile = async (req, resp, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password -__v');
        if (!user) {
            return resp.status(404).json({ error: 'User not found' });
        }
        return resp.status(200).json(user);
    } catch (error) {
        next(error);
    }
};
