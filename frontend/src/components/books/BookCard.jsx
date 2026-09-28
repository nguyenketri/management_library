import React from 'react';

export default function BookCard({ book, onEdit, onDelete }) {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="book-card">
      <div>
        <div className="book-card-header">
          <span className="category-tag">{book.category || 'Chung'}</span>
          {book.publishedYear && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              {book.publishedYear}
            </span>
          )}
        </div>

        <h3 className="book-title">{book.title}</h3>
        <div className="book-author">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {book.author}
        </div>

        {book.description && (
          <p className="book-description">{book.description}</p>
        )}
      </div>

      <div>
        <div className="book-meta">
          <div className="meta-row">
            <span>Mã ISBN:</span>
            <code>{book.isbn || 'Chưa cập nhật'}</code>
          </div>
          <div className="meta-row">
            <span>Tình trạng:</span>
            <span className={`stock-indicator ${isAvailable ? 'stock-available' : 'stock-empty'}`}>
              {isAvailable ? `Còn ${book.availableCopies}/${book.totalCopies} cuốn` : 'Hết sách'}
            </span>
          </div>
        </div>

        <div className="card-actions">
          <button className="btn-secondary" onClick={() => onEdit(book)}>
            Chỉnh sửa
          </button>
          <button className="btn-danger" onClick={() => onDelete(book._id)}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
