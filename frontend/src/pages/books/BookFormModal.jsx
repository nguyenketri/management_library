// Người phụ trách: Người 2 (Kho sách)
import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import categoryApi from '../../api/categoryApi';
import bookApi from '../../api/bookApi';

export default function BookFormModal({ open, onClose, book, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    author: '',
    publishedYear: '',
    publisher: '',
    pages: '',
    category: '',
    totalCopies: 1,
    availableCopies: 1,
    isbn: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load danh mục thực tế từ backend khi mở modal
  useEffect(() => {
    if (!open) return;
    let active = true;
    categoryApi.getAll()
      .then((data) => {
        if (active && Array.isArray(data)) {
          setCategories(data);
          // Nếu form chưa có category và có danh mục, chọn danh mục đầu tiên
          if (!book && data.length > 0) {
            setForm((prev) => ({ ...prev, category: prev.category || data[0].name }));
          }
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [open, book]);

  // Điền sẵn dữ liệu khi sửa hoặc reset khi thêm mới
  useEffect(() => {
    if (book) {
      setForm({
        title: book.title || '',
        author: book.author || '',
        publishedYear: book.publishedYear ?? '',
        publisher: book.publisher || '',
        pages: book.pages ?? '',
        category: book.category || '',
        totalCopies: book.totalCopies ?? 1,
        availableCopies: book.availableCopies ?? book.totalCopies ?? 1,
        isbn: book.isbn || '',
        description: book.description || '',
      });
    } else {
      setForm({
        title: '',
        author: '',
        publishedYear: '',
        publisher: '',
        pages: '',
        category: categories[0]?.name || '',
        totalCopies: 1,
        availableCopies: 1,
        isbn: '',
        description: '',
      });
    }
    setError('');
  }, [book, open]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Nếu là thêm mới sách và đổi totalCopies, tự động cập nhật availableCopies
      if (!book && field === 'totalCopies') {
        next.availableCopies = value;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      setError('Vui lòng nhập đầy đủ tên sách và tác giả.');
      return;
    }
    if (!form.category) {
      setError('Vui lòng chọn danh mục cho sách.');
      return;
    }

    const total = Number(form.totalCopies);
    const available = Number(form.availableCopies);
    if ([form.totalCopies, form.availableCopies].some(v => String(v).trim() === '') || !Number.isSafeInteger(total) || !Number.isSafeInteger(available) || total < 0 || available < 0) {
      setError('Số lượng sách phải là số nguyên không âm và không được để trống.');
      return;
    }
    if (form.pages !== '' && (!Number.isSafeInteger(Number(form.pages)) || Number(form.pages) < 1)) {
      setError('Số trang phải là số nguyên dương.'); return;
    }
    if (form.publishedYear !== '' && (!Number.isInteger(Number(form.publishedYear)) || Number(form.publishedYear) < 1 || Number(form.publishedYear) > new Date().getFullYear())) {
      setError('Năm xuất bản phải là số nguyên từ 1 đến năm hiện tại.'); return;
    }
    if (form.title.trim().length > 200 || form.author.trim().length > 150 || form.publisher.trim().length > 200 || form.description.trim().length > 5000 || form.isbn.trim().length > 32) {
      setError('Thông tin quá dài: tên sách/nhà xuất bản tối đa 200, tác giả 150, ISBN 32, mô tả 5000 ký tự.'); return;
    }
    if (available > total) {
      setError('Số lượng khả dụng không được lớn hơn tổng số lượng.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      ...form,
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
      publisher: form.publisher ? form.publisher.trim() : undefined,
      pages: form.pages ? Number(form.pages) : undefined,
      totalCopies: total,
      availableCopies: available,
      isbn: form.isbn?.trim() || undefined,
      description: form.description?.trim() || '',
    };

    try {
      let saved;
      if (book) {
        saved = await bookApi.update(book._id, payload);
      } else {
        saved = await bookApi.create(payload);
      }
      onSuccess?.(saved);
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu thông tin sách');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={book ? 'Sửa thông tin sách' : 'Thêm sách mới'}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang lưu…' : book ? 'Lưu thay đổi' : 'Thêm sách'}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label required">Tên sách</label>
            <input
              className="form-control"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Clean Code"
              required
            />
          </div>
          <div className="col-md-7">
            <label className="form-label required">Tác giả</label>
            <input
              className="form-control"
              value={form.author}
              onChange={(e) => handleChange('author', e.target.value)}
              placeholder="Robert C. Martin"
              required
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Năm xuất bản</label>
            <input
              type="number"
              className="form-control"
              value={form.publishedYear}
              onChange={(e) => handleChange('publishedYear', e.target.value)}
              placeholder="2008"
            />
          </div>
          <div className="col-md-7">
            <label className="form-label required">Danh mục</label>
            <select
              className="form-select"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              required
            >
              <option value="" disabled>-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-5">
            <label className="form-label required">Tổng số lượng</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={form.totalCopies}
              onChange={(e) => handleChange('totalCopies', e.target.value)}
              required
            />
          </div>
          {book && (
            <div className="col-md-5">
              <label className="form-label required">Khả dụng trên kệ</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={form.availableCopies}
                onChange={(e) => handleChange('availableCopies', e.target.value)}
                required
              />
            </div>
          )}
          <div className="col-md-7">
            <label className="form-label">Nhà xuất bản</label>
            <input
              className="form-control"
              value={form.publisher}
              onChange={(e) => handleChange('publisher', e.target.value)}
              placeholder="NXB Trẻ / O'Reilly..."
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Số trang</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={form.pages}
              onChange={(e) => handleChange('pages', e.target.value)}
              placeholder="350"
            />
          </div>
          <div className="col-12">
            <label className="form-label">ISBN</label>
            <input
              className="form-control"
              value={form.isbn}
              onChange={(e) => handleChange('isbn', e.target.value)}
              placeholder="978-0132350884"
            />
          </div>
          <div className="col-12">
            <label className="form-label">Mô tả tóm tắt</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Giới thiệu nội dung sách..."
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
