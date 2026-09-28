import React, { useState } from 'react';
import Modal from './common/Modal';
import { INITIAL_USERS } from '../constants/libraryData';

export default function BorrowModal({ isOpen, onClose, books, onBorrowSubmit, defaultUser, defaultBook }) {
  const [selectedUserId, setSelectedUserId] = useState(defaultUser?._id || 'usr_003');
  const [selectedBookId, setSelectedBookId] = useState(defaultBook?._id || (books[0]?._id || ''));
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // Mặc định hạn mượn 14 ngày
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('Mượn sách học tập');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = INITIAL_USERS.find((u) => u._id === selectedUserId);
    const book = books.find((b) => b._id === selectedBookId);

    if (!user || !book) {
      alert('Vui lòng chọn người mượn và cuốn sách hợp lệ!');
      return;
    }

    if (book.availableCopies <= 0) {
      alert(`Sách "${book.title}" hiện tại đã hết, không thể mượn!`);
      return;
    }

    onBorrowSubmit({
      userId: user._id,
      userName: user.name,
      bookId: book._id,
      bookTitle: book.title,
      dueDate,
      notes,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Lập Phiếu Mượn Sách Mới">
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Người mượn (Trong 5 thành viên):</label>
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
            {INITIAL_USERS.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} - MSSV: {u.studentId} ({u.role})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Chọn sách muốn mượn:</label>
          <select value={selectedBookId} onChange={(e) => setSelectedBookId(e.target.value)}>
            {books.map((b) => (
              <option key={b._id} value={b._id} disabled={b.availableCopies <= 0}>
                {b.title} {b.availableCopies <= 0 ? '(Đã hết sách)' : `(Còn ${b.availableCopies} cuốn)`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Hạn trả sách (Mặc định 14 ngày):</label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Ghi chú mượn:</label>
          <input
            type="text"
            placeholder="Ví dụ: Mượn làm đồ án SDN302..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn-primary">
            Xác nhận mượn sách
          </button>
        </div>
      </form>
    </Modal>
  );
}
