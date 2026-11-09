// Trang chủ sau khi đăng nhập: mỗi vai trò thấy 1 trang riêng
import { useAuth } from '../../context/AuthContext';
import ReaderHomePage from './ReaderHomePage';
import LibrarianHomePage from './LibrarianHomePage';
import AdminHomePage from './AdminHomePage';
import DashboardPage from './DashboardPage';

export default function HomePage() {
  const { role } = useAuth().user;

  if (role === 'member') return <ReaderHomePage />;        // Độc giả: Sách của tôi
  if (role === 'librarian') return <LibrarianHomePage />;  // Thủ thư: Quầy thủ thư
  if (role === 'admin') return <AdminHomePage />;          // Admin: Trang quản trị
  return <DashboardPage />;                                 // Quản lý: Tổng quan
}
