// Người phụ trách: Người 2 (Kho sách)
// TODO: gọi /api/categories (CRUD)
import { IconEdit, IconTrash } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import { CATEGORIES } from '../../constants/sampleData';

const DOTS = ['var(--lime)', 'var(--sky)', 'var(--coral)', 'var(--amber)', 'var(--lilac)', 'var(--mint)'];

export default function CategoryPage() {
  return (
    <>
      <PageHeader title="Danh mục" subtitle={`${CATEGORIES.length} danh mục sách`} />
      <div className="page-body">
        <div className="container-xl">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title mb-3">Thêm danh mục</h3>
                  <div className="mb-3">
                    <label className="form-label">Tên danh mục</label>
                    <input className="form-control" placeholder="Khoa học tự nhiên" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea className="form-control" rows={3} />
                  </div>
                  <button className="btn btn-primary w-100" type="button">Lưu</button>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="row g-3">
                {CATEGORIES.map((c, i) => (
                  <div key={c._id} className="col-md-6">
                    <div className="card h-100">
                      <div className="card-body d-flex gap-3">
                        <span style={{ width: 12, height: 12, borderRadius: 4, marginTop: 7, flex: 'none', background: DOTS[i % DOTS.length] }} />
                        <div className="flex-fill">
                          <div className="fw-bold fs-3">{c.name}</div>
                          <div className="small text-secondary">{c.description}</div>
                          <div className="small mt-2">{c.bookCount} đầu sách</div>
                        </div>
                        <div className="d-flex flex-column">
                          <button className="btn btn-ghost btn-icon" type="button" title="Sửa"><IconEdit size={17} /></button>
                          <button className="btn btn-ghost btn-icon" type="button" title="Xóa"><IconTrash size={17} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
