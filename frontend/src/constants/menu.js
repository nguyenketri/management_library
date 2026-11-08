import {
  IconLayoutDashboard,
  IconBooks,
  IconCategory,
  IconArrowsExchange,
  IconUsers,
  IconId,
  IconChartBar,
  IconUserCircle,
} from '@tabler/icons-react';

// Menu sidebar. roles: các vai trò nhìn thấy mục này (dùng khi làm phân quyền)
export const MENU = [
  { to: '/dashboard', label: 'Tổng quan', icon: IconLayoutDashboard, roles: ['admin', 'librarian', 'manager', 'member'] },
  { to: '/books', label: 'Sách', icon: IconBooks, roles: ['admin', 'librarian', 'manager', 'member'] },
  { to: '/categories', label: 'Danh mục', icon: IconCategory, roles: ['admin', 'librarian'] },
  { to: '/borrows', label: 'Mượn / Trả', icon: IconArrowsExchange, roles: ['admin', 'librarian', 'member'] },
  { to: '/members', label: 'Thành viên', icon: IconUsers, roles: ['admin', 'librarian'] },
  { to: '/cards', label: 'Thẻ thư viện', icon: IconId, roles: ['admin', 'librarian', 'member'] },
  { to: '/reports', label: 'Báo cáo', icon: IconChartBar, roles: ['admin', 'manager'] },
  { to: '/profile', label: 'Hồ sơ cá nhân', icon: IconUserCircle, roles: ['admin', 'librarian', 'manager', 'member'] },
];
