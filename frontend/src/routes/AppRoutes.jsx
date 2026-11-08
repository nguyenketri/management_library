import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import LandingPage from '../pages/landing/LandingPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import BookListPage from '../pages/books/BookListPage';
import BookDetailPage from '../pages/books/BookDetailPage';
import CategoryPage from '../pages/categories/CategoryPage';
import BorrowListPage from '../pages/borrows/BorrowListPage';
import MemberListPage from '../pages/members/MemberListPage';
import ProfilePage from '../pages/profile/ProfilePage';
import CardListPage from '../pages/cards/CardListPage';
import ReportPage from '../pages/reports/ReportPage';
import NotFoundPage from '../pages/NotFoundPage';

// Đã khai báo sẵn route cho tất cả trang -> mỗi người chỉ sửa file trang của mình
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/books" element={<BookListPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/borrows" element={<BorrowListPage />} />
        <Route path="/members" element={<MemberListPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/cards" element={<CardListPage />} />
        <Route path="/reports" element={<ReportPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
