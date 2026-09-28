import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { BOOK_CATEGORIES, INITIAL_BOOK_FORM } from '../../constants/bookConstants';

export default function BookFormModal({ isOpen, onClose, onSubmit, editingBook }) {
  const [formData, setFormData] = useState(INITIAL_BOOK_FORM);

  useEffect(() => {
    if (editingBook) {
      setFormData({
        title: editingBook.title || '',
        author: editingBook.author || '',
        isbn: editingBook.isbn || '',
        category: editingBook.category || 'Công nghệ thông tin',
        publishedYear: editingBook.publishedYear || new Date().getFullYear(),
        totalCopies: editingBook.totalCopies ?? 1,
        availableCopies: editingBook.availableCopies ?? 1,
        description: editingBook.description || '',
      });
    } else {
      setFormData(INITIAL_BOOK_FORM);
    }
  }, [editingBook, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      alert('Vui lòng nhập Tên sách và Tác giả');
      return;
    }
    onSubmit(formData);
  };

  const categories = BOOK_CATEGORIES.filter((c) => c !== 'All');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBook ? 'Cập Nhật Thông Tin Sách' : 'Thêm Sách Mới'}
    >
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Tên sách *</label>
          <input
            type="text"
            required
            placeholder="Nhập tên sách..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Tác giả *</label>
          <input
            type="text"
            required
            placeholder="Nhập tên tác giả..."
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Mã ISBN</label>
            <input
              type="text"
              placeholder="978-..."
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Năm xuất bản</label>
            <input
              type="number"
              value={formData.publishedYear}
              onChange={(e) => setFormData({ ...formData, publishedYear: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Thể loại</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tổng số cuốn</label>
            <input
              type="number"
              min="1"
              value={formData.totalCopies}
              onChange={(e) => {
                const total = Number(e.target.value);
                setFormData({
                  ...formData,
                  totalCopies: total,
                  availableCopies: Math.min(formData.availableCopies, total),
                });
              }}
            />
          </div>
          <div className="form-group">
            <label>Số cuốn sẵn sàng</label>
            <input
              type="number"
              min="0"
              max={formData.totalCopies}
              value={formData.availableCopies}
              onChange={(e) => setFormData({ ...formData, availableCopies: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Mô tả ngắn</label>
          <textarea
            rows="3"
            placeholder="Tóm tắt nội dung cuốn sách..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn-primary">
            {editingBook ? 'Lưu thay đổi' : 'Thêm sách'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
