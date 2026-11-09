import axiosClient from './axiosClient';

const borrowApi = {
  // Lấy tất cả phiếu mượn (dành cho thủ thư)
  getAll: (status) => {
    return axiosClient.get('/borrows', { params: status ? { status } : {} });
  },

  // Tất cả phiếu mượn của người đang đăng nhập
  getMyBorrows: () => axiosClient.get('/borrows/my'),

  // Độc giả đặt mượn online
  request: (bookId) => axiosClient.post('/borrows/request', { bookId }),

  // Hủy yêu cầu đang chờ duyệt
  cancelRequest: (borrowId) => axiosClient.delete(`/borrows/${borrowId}`),

  // Thủ thư duyệt hoặc từ chối yêu cầu
  approve: (borrowId) => axiosClient.patch(`/borrows/${borrowId}/approve`),
  reject: (borrowId, reason) => axiosClient.patch(`/borrows/${borrowId}/reject`, { reason }),

  // Gia hạn thêm 7 ngày (tối đa một lần)
  extend: (borrowId) => axiosClient.patch(`/borrows/${borrowId}/extend`),

  // Mượn sách
  borrow: (data) => {
    return axiosClient.post('/borrows', data);
  },

  // Trả sách
  returnBook: (borrowId) => {
    return axiosClient.put(`/borrows/${borrowId}/return`);
  },

  payFine: (borrowId) => axiosClient.patch(`/borrows/${borrowId}/pay-fine`),
};

export default borrowApi;
