import axiosClient from './axiosClient';

const userApi = {
  // Lấy danh sách 5 thành viên (hỗ trợ lọc theo role)
  getAll: (role) => {
    return axiosClient.get('/users', { params: role ? { role } : {} });
  },

  // Lấy chi tiết 1 thành viên
  getById: (id) => {
    return axiosClient.get(`/users/${id}`);
  },

  // Thêm thành viên mới
  create: (data) => {
    return axiosClient.post('/users', data);
  },
};

export default userApi;
