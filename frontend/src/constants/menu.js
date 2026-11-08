import {
  IconLayoutDashboard,
  IconBooks,
  IconCategory,
  IconArrowsExchange,
  IconUsers,
  IconId,
  IconChartBar,
  IconUserCircle,
  IconBookmark,
  IconBuildingStore,
} from '@tabler/icons-react';

// Menu sidebar theo từng actor. roles: vai trò nhìn thấy mục này.
// /dashboard là trang chủ riêng của từng vai trò (xem pages/dashboard/HomePage.jsx)
export const MENU = [
  { to: '/dashboard', label: 'Sách của tôi', icon: IconBookmark, roles: ['member'] },
  { to: '/dashboard', label: 'Quầy thủ thư', icon: IconBuildingStore, roles: ['librarian'] },
  { to: '/dashboard', label: 'Tổng quan', icon: IconLayoutDashboard, roles: ['manager', 'admin'] },
  { to: '/books', label: 'Kho sách', icon: IconBooks, roles: ['member', 'librarian', 'manager', 'admin'] },
  { to: '/categories', label: 'Danh mục', icon: IconCategory, roles: ['librarian', 'admin'] },
  { to: '/borrows', label: 'Mượn / Trả', icon: IconArrowsExchange, roles: ['librarian', 'admin'] },
  { to: '/cards', label: 'Thẻ thư viện', icon: IconId, roles: ['librarian', 'admin'] },
  { to: '/members', label: 'Thành viên', icon: IconUsers, roles: ['admin'] },
  { to: '/reports', label: 'Báo cáo', icon: IconChartBar, roles: ['manager', 'admin'] },
  { to: '/profile', label: 'Hồ sơ cá nhân', icon: IconUserCircle, roles: ['member', 'librarian', 'manager', 'admin'] },
];

// Nhân viên được thêm / sửa / xóa sách
export const isStaff = (role) => role === 'librarian' || role === 'admin';
