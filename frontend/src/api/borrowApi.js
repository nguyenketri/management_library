import axiosClient from './axiosClient';

const borrowApi = {
  // Lấy tất cả phiếu mượn (hỗ trợ lọc status: 'borrowed' hoặc 'returned')
  getAll: (status) => {
    return axiosClient.get('/borrows', { params: status ? { status } : {} });
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
