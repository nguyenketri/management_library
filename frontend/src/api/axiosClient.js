import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Gửi request: tự gắn token (lưu khi đăng nhập) vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Nhận response: trả thẳng dữ liệu; lỗi thì ném Error với thông báo lấy từ { error }
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Token hết hạn / không hợp lệ -> xóa phiên đăng nhập, quay về trang đăng nhập
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const message = error.response?.data?.error || 'Không kết nối được tới máy chủ';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
