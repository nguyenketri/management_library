import axiosClient from './axiosClient';

const bookApi = {
  // Lấy danh sách sách kèm tham số search & filter
  getAll: (params) => {
    return axiosClient.get('/books', { params });
  },

  // Lấy chi tiết sách theo ID
  getById: (id) => {
    return axiosClient.get(`/books/${id}`);
  },

  // Tạo mới sách
  create: (data) => {
    return axiosClient.post('/books', data);
  },

  // Cập nhật thông tin sách
  update: (id, data) => {
    return axiosClient.put(`/books/${id}`, data);
  },

  // Xóa sách
  delete: (id) => {
    return axiosClient.delete(`/books/${id}`);
  },

  // Kiểm tra health check backend
  checkHealth: () => {
    return axiosClient.get('/health');
  }
};

export default bookApi;
