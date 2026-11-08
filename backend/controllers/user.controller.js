// Người phụ trách: Người 1
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// Các trường được phép sửa (không cho sửa email, password qua API này)
const pickProfile = ({ name, phone, studentId }) => ({ name, phone, studentId });

// [GET] /api/users?role=member&keyword=nam
// admin: xem tất cả · librarian: chỉ xem độc giả (để lập phiếu mượn, cấp thẻ)
exports.getUsers = async (req, resp, next) => {
    try {
        const { role, keyword } = req.query;
        const filter = {};

        if (req.user.role === 'librarian') {
            filter.role = 'member';
        } else if (role && role !== 'all') {
            filter.role = role;
        }
        if (keyword && keyword.trim() !== '') {
            const regex = { $regex: keyword.trim(), $options: 'i' };
            filter.$or = [{ name: regex }, { email: regex }, { studentId: regex }];
        }

        const users = await User.find(filter).select('-password -__v').sort({ createdAt: 1 });
        return resp.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// [GET] /api/users/:id (admin)
exports.getUserById = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid userId: ${id}` });
        }

        const user = await User.findById(id).select('-password -__v');
        if (!user) {
            return resp.status(404).json({ error: 'Không tìm thấy thành viên' });
        }

        return resp.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// [POST] /api/users (admin) - tạo tài khoản với vai trò bất kỳ
exports.createUser = async (req, resp, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email) {
            return resp.status(400).json({ error: 'Vui lòng nhập họ tên và email' });
        }
        if (role && !User.ROLES.includes(role)) {
            return resp.status(400).json({ error: `Vai trò không hợp lệ: ${role}` });
        }
        if (password && password.length < 6) {
            return resp.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        const existed = await User.findOne({ email: email.toLowerCase().trim() });
        if (existed) {
            return resp.status(400).json({ error: `Email ${email} đã được sử dụng` });
        }

        const user = await User.create({
            ...pickProfile(req.body),
            email,
            role: role || 'member',
            password: await bcrypt.hash(password || 'password123', 10),
        });

        const result = user.toObject();
        delete result.password;
        return resp.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

// [PATCH] /api/users/:id/role (admin) - đổi vai trò. Body: { role }
// Admin KHÔNG được sửa thông tin cá nhân (họ tên, SĐT, MSSV) - chỉ chủ tài khoản tự sửa qua /me
exports.updateUserRole = async (req, resp, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid userId: ${id}` });
        }
        if (!User.ROLES.includes(role)) {
            return resp.status(400).json({ error: `Vai trò không hợp lệ: ${role}` });
        }
        if (id === req.user.id) {
            return resp.status(400).json({ error: 'Không thể tự đổi vai trò của mình' });
        }

        const user = await User.findById(id);
        if (!user) {
            return resp.status(404).json({ error: 'Không tìm thấy thành viên' });
        }

        user.role = role;
        await user.save();

        return resp.status(200).json({ _id: user._id, name: user.name, role: user.role });
    } catch (error) {
        next(error);
    }
};

// [PATCH] /api/users/:id/status (admin) - khóa / mở tài khoản. Body: { status: 'active' | 'locked' }
exports.updateUserStatus = async (req, resp, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid userId: ${id}` });
        }
        if (status !== 'active' && status !== 'locked') {
            return resp.status(400).json({ error: `Trạng thái không hợp lệ: ${status}` });
        }
        if (id === req.user.id) {
            return resp.status(400).json({ error: 'Không thể tự khóa tài khoản của mình' });
        }

        const user = await User.findById(id);
        if (!user) {
            return resp.status(404).json({ error: 'Không tìm thấy thành viên' });
        }

        user.status = status;
        await user.save();

        return resp.status(200).json({ _id: user._id, name: user.name, status: user.status });
    } catch (error) {
        next(error);
    }
};

// [GET] /api/users/me - hồ sơ của người đang đăng nhập
exports.getMe = async (req, resp, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password -__v');
        if (!user) {
            return resp.status(404).json({ error: 'Không tìm thấy tài khoản' });
        }

        return resp.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// [PUT] /api/users/me - tự sửa hồ sơ (họ tên, điện thoại, MSSV)
exports.updateMe = async (req, resp, next) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return resp.status(400).json({ error: 'Họ tên không được để trống' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return resp.status(404).json({ error: 'Không tìm thấy tài khoản' });
        }

        Object.assign(user, pickProfile(req.body));
        await user.save();

        const result = user.toObject();
        delete result.password;
        return resp.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
