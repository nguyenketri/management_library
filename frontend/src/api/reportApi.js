import axiosClient from './axiosClient';

const reportApi = {
  getDashboard: (params) => axiosClient.get('/reports/dashboard', { params }),
  getBooks: (params) => axiosClient.get('/reports/books', { params }),
  getReaders: (params) => axiosClient.get('/reports/readers', { params }),
  getBorrows: (params) => axiosClient.get('/reports/borrows', { params }),
  getOverdue: (params) => axiosClient.get('/reports/overdue', { params }),
};

export default reportApi;
