import axiosClient from './axiosClient';

const borrowApi = {
  // Lấy tất cả phiếu mượn (hỗ trợ lọc status: 'borrowed' hoặc 'returned')
  getAll: (status) => {
    return axiosClient.get('/borrows', { params: status ? { status } : {} });
  },

  // Sách đang mượn của 1 độc giả
  getMyBorrows: (userId) => {
    return axiosClient.get('/borrows/my-borrows', { params: userId ? { userId } : {} });
  },

  // Lịch sử mượn của 1 độc giả
  getHistory: (userId) => {
    return axiosClient.get('/borrows/my-history', { params: userId ? { userId } : {} });
  },

  // Gia hạn sách đang mượn
  extend: (borrowId, userId) => {
    return axiosClient.put(`/borrows/extend/${borrowId}`, { userId });
  },

  // Tiền phạt của độc giả
  getPenalties: (userId) => {
    return axiosClient.get('/borrows/my-penalties', { params: userId ? { userId } : {} });
  },

  // Mượn sách
  borrow: (data) => {
    return axiosClient.post('/borrows', data);
  },

  // Trả sách
  returnBook: (borrowId) => {
    return axiosClient.put(`/borrows/${borrowId}/return`);
  },
};

export default borrowApi;
