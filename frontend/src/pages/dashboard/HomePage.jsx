// Trang chủ sau khi đăng nhập: mỗi vai trò thấy 1 trang riêng
import { getCurrentUser } from '../../constants/sampleData';
import ReaderHomePage from './ReaderHomePage';
import LibrarianHomePage from './LibrarianHomePage';
import DashboardPage from './DashboardPage';

export default function HomePage() {
  const { role } = getCurrentUser();

  if (role === 'member') return <ReaderHomePage />;        // Độc giả: Sách của tôi
  if (role === 'librarian') return <LibrarianHomePage />;  // Thủ thư: Quầy thủ thư
  return <DashboardPage />;                                 // Quản lý, Admin: Tổng quan
}
