import React from 'react';

export default function BookStats({ books }) {
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + (Number(b.totalCopies) || 0), 0);
  const availableCopies = books.reduce((acc, b) => acc + (Number(b.availableCopies) || 0), 0);
  const borrowedCopies = Math.max(0, totalCopies - availableCopies);

  return (
    <section className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">Tổng số đầu sách</span>
        <span className="stat-value">{totalTitles}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Tổng số cuốn</span>
        <span className="stat-value">{totalCopies}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Đang có sẵn</span>
        <span className="stat-value" style={{ color: 'var(--success)' }}>
          {availableCopies}
        </span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Đã mượn</span>
        <span className="stat-value" style={{ color: 'var(--warning)' }}>
          {borrowedCopies}
        </span>
      </div>
    </section>
  );
}
