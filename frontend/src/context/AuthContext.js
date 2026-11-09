import { createContext, useContext } from 'react';

// Lưu thông tin đăng nhập dùng chung cho cả app (xem AuthProvider.jsx)
export const AuthContext = createContext(null);

// Dùng trong component: const { user, login, register, logout, updateUser } = useAuth();
export const useAuth = () => useContext(AuthContext);
