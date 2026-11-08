import axiosClient from './axiosClient';

// Người phụ trách: Người 1
const userApi = {
  // Danh sách thành viên: params = { role, keyword }
  getAll: (params) => axiosClient.get('/users', { params }),

  getById: (id) => axiosClient.get(`/users/${id}`),

  // Admin tạo tài khoản mới
  create: (data) => axiosClient.post('/users', data),

  // Admin đổi vai trò (không sửa được thông tin cá nhân)
  updateRole: (id, role) => axiosClient.patch(`/users/${id}/role`, { role }),

  // Khóa / mở tài khoản: status = 'active' | 'locked'
  updateStatus: (id, status) => axiosClient.patch(`/users/${id}/status`, { status }),

  // Hồ sơ của người đang đăng nhập
  getMe: () => axiosClient.get('/users/me'),
  updateMe: (data) => axiosClient.put('/users/me', data),
};

export default userApi;
