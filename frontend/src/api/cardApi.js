import axiosClient from './axiosClient';

// Người phụ trách: Người 1
const cardApi = {
  // Danh sách thẻ: params = { status, keyword }
  getAll: (params) => axiosClient.get('/cards', { params }),

  getById: (id) => axiosClient.get(`/cards/${id}`),

  // Thẻ của người đang đăng nhập (độc giả)
  getMe: () => axiosClient.get('/cards/me'),

  // Cấp thẻ cho độc giả
  create: (userId) => axiosClient.post('/cards', { userId }),

  // Khóa / mở thẻ: status = 'active' | 'locked'
  updateStatus: (id, status) => axiosClient.patch(`/cards/${id}/status`, { status }),

  // Gia hạn thêm 1 năm
  renew: (id) => axiosClient.patch(`/cards/${id}/renew`),
};

export default cardApi;
