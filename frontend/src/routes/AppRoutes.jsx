import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import LandingPage from '../pages/landing/LandingPage';
import HomePage from '../pages/dashboard/HomePage';
import BookListPage from '../pages/books/BookListPage';
import BookDetailPage from '../pages/books/BookDetailPage';
import CategoryPage from '../pages/categories/CategoryPage';
import BorrowListPage from '../pages/borrows/BorrowListPage';
import MemberListPage from '../pages/members/MemberListPage';
import ProfilePage from '../pages/profile/ProfilePage';
import CardListPage from '../pages/cards/CardListPage';
import ReportPage from '../pages/reports/ReportPage';
import NotFoundPage from '../pages/NotFoundPage';

// Vai trò được vào từng trang (khớp với menu trong constants/menu.js)
const STAFF = ['librarian', 'admin'];
const ADMIN = ['admin'];
const REPORT = ['manager', 'admin'];

// Đã khai báo sẵn route cho tất cả trang -> mỗi người chỉ sửa file trang của mình
export default function AppRoutes() {
  return (
    <Routes>
      {/* Công khai */}
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Phải đăng nhập */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/books" element={<BookListPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Phải đúng vai trò */}
        <Route path="/categories" element={<ProtectedRoute roles={STAFF}><CategoryPage /></ProtectedRoute>} />
        <Route path="/borrows" element={<ProtectedRoute roles={STAFF}><BorrowListPage /></ProtectedRoute>} />
        <Route path="/cards" element={<ProtectedRoute roles={STAFF}><CardListPage /></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute roles={ADMIN}><MemberListPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={REPORT}><ReportPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
