import { useState } from 'react';
import authApi from '../api/authApi';
import { AuthContext } from './AuthContext';

// Đọc user đã lưu (giữ đăng nhập khi F5)
const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser);

  // Lưu token + user sau khi đăng nhập / đăng ký thành công
  const saveSession = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    saveSession(data);
    return data.user;
  };

  const register = async (form) => {
    const data = await authApi.register(form);
    saveSession(data);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Cập nhật thông tin user sau khi sửa hồ sơ (tên trên topbar đổi theo)
  const updateUser = (info) => {
    const newUser = { ...user, ...info };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
