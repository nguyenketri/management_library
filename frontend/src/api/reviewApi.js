import axiosClient from './axiosClient';

const reviewApi = {
  getByBookId: (bookId) => axiosClient.get('/reviews', { params: { bookId } }),
  create: (data) => axiosClient.post('/reviews', data),
  delete: (id) => axiosClient.delete(`/reviews/${id}`),
};

export default reviewApi;
