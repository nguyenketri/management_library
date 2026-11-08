const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Tạo token: lưu id, role, name -> verifyToken giải mã ra req.user
const createToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
};

// Thông tin user trả về cho client (không có password)
const userInfo = (user) => ({
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
            return resp.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return resp.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return resp.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        return resp.status(200).json({
            token: createToken(user),
            user: userInfo(user),
        });
    } catch (error) {
        next(error);
    }
};

// [POST] /api/auth/register - người đăng ký luôn là độc giả (member)
exports.register = async (req, resp, next) => {
    try {
        const { name, email, password, phone, studentId } = req.body;

        if (!name || !email || !password) {
            return resp.status(400).json({ error: 'Vui lòng nhập họ tên, email và mật khẩu' });
        }

        if (password.length < 6) {
            return resp.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        const existed = await User.findOne({ email: email.toLowerCase().trim() });
        if (existed) {
            return resp.status(400).json({ error: `Email ${email} đã được sử dụng` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'member',
            phone,
            studentId,
        });

        return resp.status(201).json({
            token: createToken(user),
            user: userInfo(user),
        });
    } catch (error) {
        next(error);
    }
};

// [GET] /api/auth/me - thông tin người đang đăng nhập (cần token)
exports.getProfile = async (req, resp, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return resp.status(404).json({ error: 'Không tìm thấy tài khoản' });
        }

        return resp.status(200).json(userInfo(user));
    } catch (error) {
        next(error);
    }
};

// [PUT] /api/auth/change-password - đổi mật khẩu (cần token)
exports.changePassword = async (req, resp, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return resp.status(400).json({ error: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới' });
        }

        if (newPassword.length < 6) {
            return resp.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return resp.status(404).json({ error: 'Không tìm thấy tài khoản' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return resp.status(400).json({ error: 'Mật khẩu cũ không đúng' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return resp.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        next(error);
    }
};
