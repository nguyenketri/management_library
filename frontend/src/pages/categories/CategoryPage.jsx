// Người phụ trách: Người 2 (Kho sách)
import { useEffect, useState } from 'react';
import { IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import categoryApi from '../../api/categoryApi';

const DOTS = ['var(--lime)', 'var(--sky)', 'var(--coral)', 'var(--amber)', 'var(--lilac)', 'var(--mint)'];

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await categoryApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
    setActionError('');
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setActionError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setActionError('Vui lòng nhập tên danh mục');
      return;
    }

    if (name.trim().length > 100 || description.trim().length > 2000) {
      setActionError('Tên danh mục tối đa 100 ký tự, mô tả tối đa 2000 ký tự.'); return;
    }
    setSubmitting(true);
    setActionError('');

    try {
      if (editingId) {
        await categoryApi.update(editingId, { name: name.trim(), description: description.trim() });
      } else {
        await categoryApi.create({ name: name.trim(), description: description.trim() });
      }
      resetForm();
      await fetchCategories();
    } catch (err) {
      setActionError(err.message || 'Đã xảy ra lỗi khi lưu danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) {
      setActionError('');
      try {
        await categoryApi.delete(cat._id);
        if (editingId === cat._id) resetForm();
        await fetchCategories();
      } catch (err) {
        setActionError(err.message || 'Không thể xóa danh mục này');
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Danh mục sách"
        subtitle={`${categories.length} danh mục`}
      />
      <div className="page-body">
        <div className="container-xl">
          {actionError && (
            <div className="alert alert-danger mb-4" role="alert">
              {actionError}
            </div>
          )}

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card">
                <form onSubmit={handleSubmit}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="card-title mb-0">
                        {editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                      </h3>
                      {editingId && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm text-secondary"
                          onClick={resetForm}
                        >
                          <IconX size={16} className="me-1" /> Hủy sửa
                        </button>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label required">Tên danh mục</label>
                      <input
                        className="form-control"
                        placeholder="Ví dụ: Công nghệ thông tin"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Mô tả</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Mô tả tóm tắt về loại sách này"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary flex-fill"
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting ? 'Đang lưu…' : editingId ? 'Cập nhật' : 'Thêm danh mục'}
                      </button>
                      {editingId && (
                        <button
                          className="btn btn-ghost"
                          type="button"
                          onClick={resetForm}
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-8">
              {loading ? (
                <div className="text-center py-5 text-secondary">Đang tải danh mục…</div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : categories.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center py-5 text-secondary">
                    Chưa có danh mục nào. Hãy tạo danh mục đầu tiên ở bên trái!
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  {categories.map((c, i) => (
                    <div key={c._id} className="col-md-6">
                      <div className={`card h-100 ${editingId === c._id ? 'border-primary' : ''}`}>
                        <div className="card-body d-flex gap-3">
                          <span
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 4,
                              marginTop: 7,
                              flex: 'none',
                              background: DOTS[i % DOTS.length],
                            }}
                          />
                          <div className="flex-fill">
                            <div className="fw-bold fs-3">{c.name}</div>
                            <div className="small text-secondary mt-1">
                              {c.description || 'Không có mô tả'}
                            </div>
                            <div className="small mt-2 text-lime fw-medium">
                              {c.bookCount || 0} đầu sách
                            </div>
                          </div>
                          <div className="d-flex flex-column gap-1">
                            <button
                              className="btn btn-ghost btn-icon"
                              type="button"
                              title="Sửa danh mục"
                              onClick={() => handleStartEdit(c)}
                            >
                              <IconEdit size={17} />
                            </button>
                            <button
                              className="btn btn-ghost btn-icon text-danger"
                              type="button"
                              title="Xóa danh mục"
                              onClick={() => handleDelete(c)}
                            >
                              <IconTrash size={17} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
