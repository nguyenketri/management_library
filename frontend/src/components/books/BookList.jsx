import React from 'react';
import BookCard from './BookCard';

export default function BookList({ books, loading, onEdit, onDelete }) {
  if (loading) {
    return <div className="empty-state">Đang tải danh sách sách...</div>;
  }

  if (books.length === 0) {
    return (
      <div className="empty-state">
        <p>Không tìm thấy cuốn sách nào phù hợp.</p>
      </div>
    );
  }

  return (
    <main className="book-grid">
      {books.map((book) => (
        <BookCard
          key={book._id}
          book={book}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </main>
  );
}
