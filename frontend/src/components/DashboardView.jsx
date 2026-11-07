import React, { useState } from 'react';
import { BOOK_CATEGORIES } from '../constants/libraryData';
import DashboardReport from './reports/DashboardReport';
import BookReport from './reports/BookReport';
import ReaderReport from './reports/ReaderReport';
import BorrowReport from './reports/BorrowReport';
import OverdueReport from './reports/OverdueReport';

// Các vai trò được xem thống kê
const ALLOWED_ROLES = ['manager', 'admin'];

const REPORT_TABS = [
  { key: 'dashboard', label: '📊 Tổng quan', Component: DashboardReport },
  { key: 'books', label: '📚 Sách', Component: BookReport },
  { key: 'readers', label: '🎓 Bạn đọc', Component: ReaderReport },
  { key: 'borrows', label: '📝 Mượn / Trả', Component: BorrowReport },
  { key: 'overdue', label: '⏰ Quá hạn', Component: OverdueReport },
];

// Màn hình Thống kê & Báo cáo cho Quản lý thư viện (chỉ xem)
export default function DashboardView({ currentUser, books, borrows, isBackendConnected }) {
  const [activeReport, setActiveReport] = useState('dashboard');

  if (!currentUser || !ALLOWED_ROLES.includes(currentUser.role)) {
    return (
      <div className="alert alert-warning">
        🔒 Bạn không có quyền xem thống kê. Chức năng này dành cho Quản lý thư viện và Admin.
      </div>
    );
  }

  // Thể loại cho bộ lọc: danh mục mẫu + các thể loại đang có trong dữ liệu
  const categories = [...new Set([...BOOK_CATEGORIES, ...books.map((b) => b.category).filter(Boolean)])];
  const context = { isBackendConnected, books, borrows, categories };
  const { Component } = REPORT_TABS.find((tab) => tab.key === activeReport);

  return (
    <div>
      <div className="section-intro">
        <h3>📊 Thống Kê & Báo Cáo</h3>
        <p>Theo dõi tình hình hoạt động của thư viện: kho sách, bạn đọc, mượn/trả và sách quá hạn.</p>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-pill ${activeReport === tab.key ? 'active' : ''}`}
            onClick={() => setActiveReport(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Component key={activeReport} context={context} />
    </div>
  );
}
