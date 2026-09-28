import React, { useState } from 'react';

export default function BorrowsView({ borrows, onReturnBook, onOpenBorrowModal, currentUser }) {
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = borrows.filter((b) => {
    if (filterStatus === 'All') return true;
    return b.status === filterStatus;
  });

  return (
    <div>
      <div className="toolbar">
        <div className="filters-group">
          <button
            className={`tab-pill ${filterStatus === 'All' ? 'active' : ''}`}
            onClick={() => setFilterStatus('All')}
          >
            Tất cả phiếu ({borrows.length})
          </button>
          <button
            className={`tab-pill ${filterStatus === 'borrowed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('borrowed')}
          >
            Đang mượn ({borrows.filter((b) => b.status === 'borrowed').length})
          </button>
          <button
            className={`tab-pill ${filterStatus === 'returned' ? 'active' : ''}`}
            onClick={() => setFilterStatus('returned')}
          >
            Đã trả ({borrows.filter((b) => b.status === 'returned').length})
          </button>
        </div>

        <button className="btn-primary" onClick={onOpenBorrowModal}>
          + Lập Phiếu Mượn Mới
        </button>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mã Phiếu</th>
              <th>Người Mượn</th>
              <th>Tên Sách</th>
              <th>Ngày Mượn</th>
              <th>Hạn Trả</th>
              <th>Trạng Thái</th>
              <th>Ghi Chú</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                  Không có phiếu mượn nào trong danh mục này.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isBorrowing = item.status === 'borrowed';
                return (
                  <tr key={item._id}>
                    <td><code>{item._id}</code></td>
                    <td><strong>{item.userName}</strong></td>
                    <td style={{ maxWidth: '280px' }}>{item.bookTitle}</td>
                    <td>{item.borrowDate}</td>
                    <td style={{ color: isBorrowing ? 'var(--warning)' : 'inherit' }}>
                      {item.dueDate}
                    </td>
                    <td>
                      <span className={`status-tag ${isBorrowing ? 'tag-borrowed' : 'tag-returned'}`}>
                        {isBorrowing ? '⏳ Đang mượn' : '✅ Đã trả sách'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      {item.notes || '-'}
                    </td>
                    <td>
                      {isBorrowing ? (
                        <button
                          className="btn-success-sm"
                          onClick={() => onReturnBook(item._id)}
                          title="Bấm để xác nhận trả sách và cộng lại 1 cuốn vào kho"
                        >
                          Trả Sách
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          Ngày trả: {item.returnDate || '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
