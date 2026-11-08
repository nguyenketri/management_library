import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Khung chung cho các trang sau khi đăng nhập: sidebar trái + topbar + nội dung
export default function MainLayout() {
  return (
    <div className="page">
      <Sidebar />
      <div className="page-wrapper">
        <Topbar />
        <Outlet />
        <footer className="footer footer-transparent d-print-none">
          <div className="container-xl small">© 2026 fu.library · Đồ án SDN302</div>
        </footer>
      </div>
    </div>
  );
}
