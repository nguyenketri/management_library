const mongoose = require('mongoose');
const User = require('../models/User');
const { mockDB } = require('../mock/mockData');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// 1. Đăng nhập tài khoản
const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu!');
  }

  let user = null;

  if (isMongoConnected()) {
    user = await User.findOne({ email: email.toLowerCase().trim() });
  } else {
    user = mockDB.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  if (!user) {
    throw new Error('Tài khoản email này chưa được đăng ký!');
  }

  // So sánh mật khẩu đơn giản (chuẩn SDN302)
  if (user.password !== password) {
    throw new Error('Mật khẩu không chính xác!');
  }

  // Trả về thông tin người dùng (bỏ password đi vì lý do bảo mật)
  const userSafe = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    studentId: user.studentId,
  };

  return userSafe;
};

// 2. Đăng ký tài khoản mới (mặc định là độc giả / sinh viên)
const register = async ({ name, email, password, role, phone, studentId }) => {
  if (!name || !email || !password) {
    throw new Error('Vui lòng điền Họ tên, Email và Mật khẩu!');
  }

  const cleanEmail = email.toLowerCase().trim();

  if (isMongoConnected()) {
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      throw new Error(`Email "${cleanEmail}" đã được sử dụng bởi tài khoản khác!`);
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role || 'member',
      phone: phone || '',
      studentId: studentId || `SV-${Date.now().toString().slice(-4)}`,
    });

    return {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      studentId: newUser.studentId,
    };
  }

  // Mock DB
  if (mockDB.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error(`Email "${cleanEmail}" đã tồn tại trong danh sách thành viên!`);
  }

  const newUser = {
    _id: `usr_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    password,
    role: role || 'member',
    phone: phone || '',
    studentId: studentId || `SV-${Date.now().toString().slice(-4)}`,
    createdAt: new Date(),
  };

  mockDB.users.push(newUser);

  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    phone: newUser.phone,
    studentId: newUser.studentId,
  };
};

module.exports = {
  login,
  register,
};
