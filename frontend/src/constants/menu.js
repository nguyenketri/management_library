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
  IconShieldCheck,
} from '@tabler/icons-react';

// Mỗi vai trò phụ trách 1 mảng riêng, không chồng lên nhau:
//   admin     – quản trị tài khoản
//   librarian – nghiệp vụ thư viện (sách, danh mục, thẻ, mượn / trả)
//   manager   – theo dõi, báo cáo
//   member    – mượn sách của mình
// Giữ khớp với phân quyền trong routes/AppRoutes.jsx

// Menu sidebar. roles: vai trò nhìn thấy mục này.
// /dashboard là trang chủ riêng của từng vai trò (xem pages/dashboard/HomePage.jsx)
export const MENU = [
  { to: '/dashboard', label: 'Sách của tôi', icon: IconBookmark, roles: ['member'] },
  { to: '/dashboard', label: 'Quầy thủ thư', icon: IconBuildingStore, roles: ['librarian'] },
  { to: '/dashboard', label: 'Tổng quan', icon: IconLayoutDashboard, roles: ['manager'] },
  { to: '/dashboard', label: 'Trang quản trị', icon: IconShieldCheck, roles: ['admin'] },
  { to: '/books', label: 'Kho sách', icon: IconBooks, roles: ['member', 'librarian', 'manager'] },
  { to: '/categories', label: 'Danh mục', icon: IconCategory, roles: ['librarian'] },
  { to: '/borrows', label: 'Mượn / Trả', icon: IconArrowsExchange, roles: ['librarian'] },
  { to: '/cards', label: 'Thẻ thư viện', icon: IconId, roles: ['librarian'] },
  { to: '/members', label: 'Thành viên', icon: IconUsers, roles: ['admin'] },
  { to: '/reports', label: 'Báo cáo', icon: IconChartBar, roles: ['manager'] },
  { to: '/profile', label: 'Hồ sơ cá nhân', icon: IconUserCircle, roles: ['member', 'librarian', 'manager', 'admin'] },
];

// Ai được thêm / sửa / xóa sách (người khác vào Kho sách chỉ xem)
export const isStaff = (role) => role === 'librarian';
