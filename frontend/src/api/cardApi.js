import axiosClient from './axiosClient';

// TODO: bổ sung theo API /api/cards
const cardApi = {
  getAll: (params) => axiosClient.get('/cards', { params }),
};

export default cardApi;
