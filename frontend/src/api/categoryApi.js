import axiosClient from './axiosClient';

// TODO: bổ sung theo API /api/categories
const categoryApi = {
  getAll: (params) => axiosClient.get('/categories', { params }),
};

export default categoryApi;
