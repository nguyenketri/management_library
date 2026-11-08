// models/user.model.js - collection "users" (Người dùng: admin, librarian, member, manager)
const { Schema, model } = require('mongoose');

const ROLES = ['admin', 'librarian', 'member', 'manager'];

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập họ và tên'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    // Lưu mật khẩu đã băm bằng bcrypt, không bao giờ trả về client
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
    },
    role: {
        type: String,
        enum: ROLES,
        default: 'member',
    },
    phone: { type: String, trim: true },
    studentId: { type: String, trim: true },
}, {
    collection: 'users',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const User = model('User', userSchema);
module.exports = User;
module.exports.ROLES = ROLES;
