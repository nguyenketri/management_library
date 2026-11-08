import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Chặn trang:
// - Chưa đăng nhập      -> chuyển về /login (đăng nhập xong quay lại đúng trang cũ)
// - Không đúng vai trò  -> chuyển về /dashboard
// Ví dụ: <ProtectedRoute roles={['admin']}><MemberListPage /></ProtectedRoute>
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
