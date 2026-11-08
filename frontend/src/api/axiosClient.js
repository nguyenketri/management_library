import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: tự gắn JWT (lưu ở localStorage khi đăng nhập) vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor: trả thẳng body (backend trả dữ liệu thô), lỗi lấy từ field { error }
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'Có lỗi xảy ra khi gọi API';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
