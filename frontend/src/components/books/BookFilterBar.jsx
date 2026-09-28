import React from 'react';
import { BOOK_CATEGORIES } from '../../constants/bookConstants';

export default function BookFilterBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onRefresh,
}) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <svg
          className="search-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Tìm theo tên sách hoặc tác giả..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filters-group">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {BOOK_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'Tất cả thể loại' : cat}
            </option>
          ))}
        </select>

        <button className="btn-secondary" onClick={onRefresh} title="Tải lại dữ liệu">
          Làm mới
        </button>
      </div>
    </div>
  );
}
