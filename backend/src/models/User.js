const mongoose = require('mongoose');

// Schema Người dùng (Actors: Admin, Thủ thư, Độc giả)
const userSchema = new mongoose.Schema(
  {
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
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      default: '123456',
    },
    role: {
      type: String,
      enum: ['admin', 'librarian', 'member'],
      default: 'member', // Mặc định là độc giả
    },
    phone: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);
