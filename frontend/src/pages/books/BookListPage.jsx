// Người phụ trách: Người 2 (Kho sách)
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import BookCover from '../../components/common/BookCover';
import BookFormModal from './BookFormModal';
import { useAuth } from '../../context/AuthContext';
import { isStaff } from '../../constants/menu';
import bookApi from '../../api/bookApi';

export default function BookListPage() {
  const [books, setBooks] = useState([]);
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const staff = isStaff(useAuth().user.role); // chỉ thủ thư được thêm sách (admin chỉ xem)

  useEffect(() => {
    let active = true;
    bookApi.getAll()
      .then((result) => {
        if (active) setBooks(result);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => [...new Set(books.map((book) => book.category).filter(Boolean))].sort(),
    [books]
  );
  const filteredBooks = books.filter((book) => {
    const matchesCategory = category === 'all' || book.category === category;
    const normalizedKeyword = keyword.trim().toLocaleLowerCase();
    const matchesKeyword = !normalizedKeyword
      || book.title.toLocaleLowerCase().includes(normalizedKeyword)
      || book.author.toLocaleLowerCase().includes(normalizedKeyword);
    return matchesCategory && matchesKeyword;
  });
  const totalCopies = books.reduce((total, book) => total + (book.totalCopies || 0), 0);

  return (
    <>
      <PageHeader
        title="Kho sách"
        subtitle={`${books.length} đầu sách · ${totalCopies} cuốn`}
        actions={staff && <button className="btn btn-primary" type="button" onClick={() => setOpenForm(true)}><IconPlus size={17} className="me-1" /> Thêm sách</button>}
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
            <div className="pill-tabs me-auto">
              <button type="button" className={`pill-tab ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>Tất cả</button>
              {categories.map((name) => (
                <button key={name} type="button" className={`pill-tab ${category === name ? 'active' : ''}`} onClick={() => setCategory(name)}>
                  {name}
                </button>
              ))}
            </div>
            <label className="input-pill mb-0" style={{ width: 280, padding: '0.45rem 1rem' }}>
              <IconSearch size={16} className="text-secondary" />
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tên sách, tác giả…" />
            </label>
          </div>

          <div className="row g-4">
            {filteredBooks.map((b) => (
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
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            {loading && <div className="col-12 text-center text-secondary py-5">Đang tải sách…</div>}
            {!loading && error && <div className="col-12"><div className="form-error">{error}</div></div>}
            {!loading && !error && filteredBooks.length === 0 && <div className="col-12 text-center text-secondary py-5">Không tìm thấy sách phù hợp.</div>}
          </div>
        </div>
      </div>
      <BookFormModal open={openForm} onClose={() => setOpenForm(false)} />
    </>
  );
}
