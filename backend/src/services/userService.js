const mongoose = require('mongoose');
const User = require('../models/User');
const { mockDB } = require('../mock/mockData');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// 1. Lấy danh sách thành viên (5 người dùng mẫu)
const getAllUsers = async (role) => {
  if (isMongoConnected()) {
    const query = role ? { role } : {};
    return await User.find(query).sort({ createdAt: 1 });
  }

  let users = [...mockDB.users];
  if (role) {
    users = users.filter((u) => u.role === role);
  }
  return users;
};

// 2. Lấy thông tin 1 thành viên theo ID
const getUserById = async (id) => {
  if (isMongoConnected()) {
    return await User.findById(id);
  }
  return mockDB.users.find((u) => u._id === id) || null;
};

// 3. Thêm mới thành viên
const createUser = async (userData) => {
  const { name, email, role, phone, studentId } = userData;

  if (isMongoConnected()) {
    return await User.create({ name, email, role, phone, studentId });
  }

  if (mockDB.users.some((u) => u.email === email)) {
    throw new Error(`Email "${email}" đã được đăng ký tài khoản!`);
  }

  const newUser = {
    _id: `usr_${Date.now()}`,
    name,
    email,
    role: role || 'member',
    phone: phone || '',
    studentId: studentId || '',
    createdAt: new Date(),
  };

  mockDB.users.push(newUser);
  return newUser;
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};
