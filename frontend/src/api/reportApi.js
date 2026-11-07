import axiosClient from './axiosClient';

// Bỏ các tham số rỗng hoặc 'All' để URL gọn và không lọc thừa
const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '' && value !== 'All')
  );

const reportApi = {
  // Tổng quan: ?from&to
  getDashboard: (params) => axiosClient.get('/reports/dashboard', { params: cleanParams(params) }),

  // Báo cáo sách: ?category&keyword&availability
  getBooks: (params) => axiosClient.get('/reports/books', { params: cleanParams(params) }),

  // Báo cáo bạn đọc: ?from&to&keyword&hasActiveLoan
  getReaders: (params) => axiosClient.get('/reports/readers', { params: cleanParams(params) }),

  // Báo cáo mượn/trả: ?from&to&category&status&groupBy
  getBorrows: (params) => axiosClient.get('/reports/borrows', { params: cleanParams(params) }),

  // Báo cáo quá hạn: ?category&keyword&minDays
  getOverdue: (params) => axiosClient.get('/reports/overdue', { params: cleanParams(params) }),
};

export default reportApi;
