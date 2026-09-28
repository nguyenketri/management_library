const userService = require('../services/userService');

// [GET] /api/users - Lấy danh sách thành viên
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await userService.getAllUsers(role);
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message,
    });
  }
};

// [GET] /api/users/:id - Lấy chi tiết 1 thành viên
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành viên!',
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message,
    });
  }
};

// [POST] /api/users - Thêm thành viên mới
const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Họ tên và email là bắt buộc!',
      });
    }
    const newUser = await userService.createUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'Thêm thành viên thành công!',
      data: newUser,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
};
