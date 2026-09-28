import React from 'react';
import { BOOK_CATEGORIES } from '../constants/libraryData';

export default function BooksView({
  books,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteBook,
  onQuickBorrow,
  currentUser,
}) {
  const isStaff = currentUser.role === 'admin' || currentUser.role === 'librarian';

  return (
    <div>
      {/* Thanh công cụ tìm kiếm và lọc */}
      <div className="toolbar">
        <div className="search-box">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)}>
            {BOOK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'Tất cả thể loại' : cat}
              </option>
            ))}
          </select>

          {isStaff && (
            <button className="btn-primary" onClick={onOpenAddModal}>
              + Thêm Sách Mới
            </button>
          )}
        </div>
      </div>

      {/* Grid danh sách sách */}
      <div className="book-grid">
        {books.length === 0 ? (
          <div className="empty-state">Không tìm thấy cuốn sách nào phù hợp.</div>
        ) : (
          books.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <div key={book._id} className="book-card">
                <div>
                  <div className="book-card-header">
                    <span className="category-tag">{book.category || 'Chung'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Năm: {book.publishedYear}
                    </span>
                  </div>

                  <h3 className="book-title">{book.title}</h3>
                  <div className="book-author">✍️ {book.author}</div>
                  {book.description && <p className="book-description">{book.description}</p>}
                </div>

                <div>
                  <div className="book-meta">
                    <div className="meta-row">
                      <span>Mã ISBN:</span>
                      <code>{book.isbn}</code>
                    </div>
                    <div className="meta-row">
                      <span>Tình trạng kho:</span>
                      <span className={`stock-indicator ${isAvailable ? 'stock-available' : 'stock-empty'}`}>
                        {isAvailable ? `Còn ${book.availableCopies}/${book.totalCopies} cuốn` : 'Hết sách'}
                      </span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn-primary"
                      style={{ flex: 1 }}
                      disabled={!isAvailable}
                      onClick={() => onQuickBorrow(book)}
                    >
                      {isAvailable ? '📖 Mượn sách' : 'Tạm hết'}
                    </button>

                    {isStaff && (
                      <>
                        <button className="btn-secondary" onClick={() => onOpenEditModal(book)}>
                          Sửa
                        </button>
                        <button className="btn-danger" onClick={() => onDeleteBook(book._id)}>
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
