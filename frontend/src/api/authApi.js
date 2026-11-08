import axiosClient from './axiosClient';

const authApi = {
  // Đăng nhập -> { token, user }
  login: (data) => axiosClient.post('/auth/login', data),

  // Đăng ký độc giả mới -> { token, user }
  register: (data) => axiosClient.post('/auth/register', data),

  // Thông tin người đang đăng nhập
  getProfile: () => axiosClient.get('/auth/me'),

  // Đổi mật khẩu: { oldPassword, newPassword }
  changePassword: (data) => axiosClient.put('/auth/change-password', data),
};

export default authApi;
