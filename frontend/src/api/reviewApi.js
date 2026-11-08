import axiosClient from './axiosClient';

// TODO: bổ sung theo API /api/reviews
const reviewApi = {
  getAll: (params) => axiosClient.get('/reviews', { params }),
};

export default reviewApi;
