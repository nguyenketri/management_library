// Người phụ trách: Người 2 (Kho sách)
// TODO: gọi bookApi.getAll({ keyword, category }), thêm/sửa/xóa sách (modal), phân trang
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import BookCover from '../../components/common/BookCover';
import { BOOKS, CATEGORIES } from '../../constants/sampleData';

export default function BookListPage() {
  const [category, setCategory] = useState('all'); // chỉ để demo giao diện tab

  return (
    <>
      <PageHeader
        title="Kho sách"
        subtitle={`${BOOKS.length} đầu sách · 30 cuốn`}
        actions={<button className="btn btn-primary" type="button"><IconPlus size={17} className="me-1" /> Thêm sách</button>}
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
            <div className="pill-tabs me-auto">
              <button type="button" className={`pill-tab ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>Tất cả</button>
              {CATEGORIES.map((c) => (
                <button key={c._id} type="button" className={`pill-tab ${category === c._id ? 'active' : ''}`} onClick={() => setCategory(c._id)}>
                  {c.name}
                </button>
              ))}
            </div>
            <label className="input-pill mb-0" style={{ width: 280, padding: '0.45rem 1rem' }}>
              <IconSearch size={16} className="text-secondary" />
              <input placeholder="Tên sách, tác giả…" />
            </label>
          </div>

          <div className="row g-4">
            {BOOKS.map((b) => (
              <div key={b._id} className="col-6 col-md-4 col-xl-2">
                <Link to={`/books/${b._id}`} className="book-tile">
                  <BookCover book={b} />
                  <div className="mt-3">
                    <div className="fw-bold text-truncate" title={b.title}>{b.title}</div>
                    <div className="small text-secondary text-truncate">{b.author}</div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      {b.availableCopies > 0
                        ? <span className="pill pill-lime">Còn {b.availableCopies}</span>
                        : <span className="pill pill-coral">Hết sách</span>}
                      <span className="stars small">★ {b.rating}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-center mt-5">
            <ul className="pagination">
              <li className="page-item active"><a className="page-link" href="#">1</a></li>
              <li className="page-item"><a className="page-link" href="#">2</a></li>
              <li className="page-item"><a className="page-link" href="#">→</a></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
