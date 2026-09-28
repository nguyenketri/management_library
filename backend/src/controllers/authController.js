const authService = require('../services/authService');

// [POST] /api/auth/login - Đăng nhập
const login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    return res.status(200).json({
      success: true,
      message: `Chào mừng ${user.name} đăng nhập thành công!`,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// [POST] /api/auth/register - Đăng ký
const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành viên thành công!',
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  register,
};
