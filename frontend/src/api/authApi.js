import axiosClient from './axiosClient';

const authApi = {
  // Đăng nhập
  login: (credentials) => {
    return axiosClient.post('/auth/login', credentials);
  },

  // Đăng ký tài khoản mới
  register: (userData) => {
    return axiosClient.post('/auth/register', userData);
  },
};

export default authApi;
