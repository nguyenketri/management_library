import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response Interceptor: Tự động trích xuất data hoặc format error
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi gọi API';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
