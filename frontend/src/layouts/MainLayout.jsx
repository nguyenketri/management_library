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
      </div>
    </div>
  );
}
