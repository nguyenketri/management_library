// Người phụ trách: Người 2 (Kho sách)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconPlus, IconSearch, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import BookCover from '../../components/common/BookCover';
import BookFormModal from './BookFormModal';
import { useAuth } from '../../context/AuthContext';
import { isStaff } from '../../constants/menu';
import bookApi from '../../api/bookApi';
import categoryApi from '../../api/categoryApi';

export default function BookListPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const staff = isStaff(useAuth().user?.role);

  // Load danh mục
  useEffect(() => {
    let active = true;
    categoryApi.getAll()
      .then((data) => {
        if (active && Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Fetch danh sách sách kèm phân trang
  const fetchBooks = (targetPage = page) => {
    setLoading(true);
    setError('');
    const params = {
      page: targetPage,
      limit: 12,
    };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (selectedCategory !== 'all') params.category = selectedCategory;

    bookApi.getAll(params)
      .then((result) => {
        if (result && Array.isArray(result.books)) {
          setBooks(result.books);
          setTotalBooks(result.total || result.books.length);
          setTotalPages(result.totalPages || 1);
          setPage(result.page || targetPage);
        } else if (Array.isArray(result)) {
          setBooks(result);
          setTotalBooks(result.length);
          setTotalPages(1);
        }
      })
      .catch((err) => {
        setError(err.message || 'Không thể tải danh sách sách');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBooks(page);
  }, [page, selectedCategory, keyword]);

  const handleCategoryChange = (catName) => {
    setSelectedCategory(catName);
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <PageHeader
        title="Kho sách"
        subtitle={`${totalBooks} đầu sách sẵn sàng phục vụ`}
        actions={
          staff && (
            <button className="btn btn-primary" type="button" onClick={() => setOpenForm(true)}>
              <IconPlus size={17} className="me-1" /> Thêm sách
            </button>
          )
        }
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div className="pill-tabs">
              <button
                type="button"
                className={`pill-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                Tất cả
              </button>
              {categories.map((c) => (
                <button
                  key={c._id || c.name}
                  type="button"
                  className={`pill-tab ${selectedCategory === c.name ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(c.name)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
              <label className="input-pill mb-0" style={{ width: 280, padding: '0.45rem 1rem' }}>
                <IconSearch size={16} className="text-secondary" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tên sách, tác giả, ISBN…"
                />
              </label>
              <button type="submit" className="btn btn-outline btn-sm">Tìm</button>
            </form>
          </div>

          <div className="row g-4">
            {books.map((b) => (
              <div key={b._id} className="col-6 col-md-4 col-xl-2">
                <Link to={`/books/${b._id}`} className="book-tile">
                  <BookCover book={b} />
                  <div className="mt-3">
                    <div className="fw-bold text-truncate" title={b.title}>{b.title}</div>
                    <div className="small text-secondary text-truncate">{b.author}</div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      {b.availableCopies > 0 ? (
                        <span className="pill pill-lime">Còn {b.availableCopies}</span>
                      ) : (
                        <span className="pill pill-coral">Hết sách</span>
                      )}
                      {b.rating && (
                        <span className="small text-warning fw-medium">★ {b.rating}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {loading && <div className="col-12 text-center text-secondary py-5">Đang tải danh sách sách…</div>}
            {!loading && error && <div className="col-12"><div className="alert alert-danger">{error}</div></div>}
            {!loading && !error && books.length === 0 && (
              <div className="col-12 text-center text-secondary py-5">
                Không tìm thấy sách phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </div>

          {/* Phân trang (Pagination) */}
          {!loading && totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <IconChevronLeft size={16} className="me-1" /> Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Sau <IconChevronRight size={16} className="ms-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      <BookFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => fetchBooks(1)}
      />
    </>
  );
}
