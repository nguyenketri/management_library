import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import BookCover from '../../components/common/BookCover';
import ReviewSection from './ReviewSection';
import BookFormModal from './BookFormModal';
import { useAuth } from '../../context/AuthContext';
import { isStaff } from '../../constants/menu';
import bookApi from '../../api/bookApi';
import borrowApi from '../../api/borrowApi';

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(value);

export default function BookDetailPage() {
  const { id } = useParams();
  const [bookLoad, setBookLoad] = useState({ id: null, book: null, error: '', loading: true });
  const [openForm, setOpenForm] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestedBookId, setRequestedBookId] = useState('');
  const [requestErrorState, setRequestErrorState] = useState({ id: null, error: '' });
  const user = useAuth().user;
  const staff = isStaff(user.role);
  const validBookId = isMongoId(id);
  const book = validBookId && bookLoad.id === id ? bookLoad.book : null;
  const loading = validBookId && (bookLoad.id !== id || bookLoad.loading);
  const requestError = requestErrorState.id === id ? requestErrorState.error : '';
  const error = requestError || (!validBookId
    ? 'Đường dẫn sách không hợp lệ. Vui lòng quay lại kho sách và chọn sách từ danh sách hiện tại.'
    : bookLoad.id === id ? bookLoad.error : '');
  const requested = requestedBookId === id;

  useEffect(() => {
    if (!isMongoId(id)) return undefined;

    let active = true;
    bookApi.getById(id)
      .then((result) => {
        if (active) setBookLoad({ id, book: result, error: '', loading: false });
      })
      .catch((err) => {
        if (active) setBookLoad({ id, book: null, error: err.message, loading: false });
      });
    return () => { active = false; };
  }, [id]);

  const handleRequest = async () => {
    if (!isMongoId(book?._id)) {
      setRequestErrorState({ id, error: 'Thông tin sách không hợp lệ. Vui lòng quay lại kho sách và chọn sách từ danh sách hiện tại.' });
      return;
    }
    setRequesting(true);
    setRequestErrorState({ id, error: '' });
    try {
      await borrowApi.request(book._id);
      setRequestedBookId(id);
    } catch (err) {
      setRequestErrorState({ id, error: err.message });
    } finally {
      setRequesting(false);
    }
  };

  if (!book) {
    return (
      <div className="page-body">
        <div className="container-xl pt-4">
          <Link to="/books" className="btn btn-ghost mb-4"><IconArrowLeft size={17} className="me-1" /> Kho sách</Link>
          {loading ? <div className="text-secondary">Đang tải thông tin sách…</div> : <div className="form-error">{error || 'Không tìm thấy sách.'}</div>}
        </div>
      </div>
    );
  }

  const info = [
    ['Tác giả', book.author],
    ['Danh mục', book.category],
    ['Nhà xuất bản', book.publisher],
    ['Năm', book.publishedYear],
    ['Số trang', book.pages],
    ['ISBN', book.isbn],
  ];

  return (
    <div className="page-body">
      <div className="container-xl pt-4">
        <Link to="/books" className="btn btn-ghost mb-4"><IconArrowLeft size={17} className="me-1" /> Kho sách</Link>

        <div className="row g-5 align-items-center">
          <div className="col-md-auto">
            <BookCover book={book} size="lg" />
          </div>
          <div className="col">
            <span className="pill pill-lilac mb-3">{book.category}</span>
            <h1 className="display-5 fw-bold mb-2" style={{ letterSpacing: '-0.045em' }}>{book.title}</h1>
            <div className="text-secondary fs-3 mb-4">{book.author} · <span className="stars">★ {book.rating}</span></div>
            <p className="fs-3 text-secondary" style={{ maxWidth: '36rem' }}>{book.description}</p>

            {/* Thủ thư / admin: sửa, xóa · Người khác: chỉ xem tình trạng */}
            <div className="d-flex flex-wrap align-items-center gap-2 my-4">
              {staff ? (
                <>
                  <button className="btn btn-outline btn-lg" type="button" onClick={() => setOpenForm(true)}><IconEdit size={18} className="me-1" /> Sửa</button>
                  <button className="btn btn-outline-danger btn-lg" type="button"><IconTrash size={18} className="me-1" /> Xóa</button>
                </>
              ) : (
                <>
                  {user.role === 'member' ? (
                    <button className="btn btn-primary btn-lg" type="button" disabled={!isMongoId(book._id) || !book.availableCopies || requesting || requested} onClick={handleRequest}>
                      {requesting ? 'Đang gửi yêu cầu…' : requested ? 'Đã đặt mượn · chờ thủ thư duyệt' : 'Đặt mượn'}
                    </button>
                  ) : (
                    <span className={`pill ${book.availableCopies ? 'pill-lime' : 'pill-coral'}`}>
                      {book.availableCopies ? 'Còn trên kệ' : 'Đã hết sách'}
                    </span>
                  )}
                  {!book.availableCopies && <span className="pill pill-coral">Đã hết sách</span>}
                </>
              )}
            </div>
            {error && <div className="form-error mb-3">{error}</div>}
            {requested && (
              <div className="form-success mb-3" role="status" aria-live="polite">
                Yêu cầu đặt mượn <strong>{book.title}</strong> đã được gửi và đang chờ thủ thư duyệt. Bạn sẽ nhận sách tại quầy sau khi được duyệt.{' '}
                <Link to="/dashboard">Theo dõi yêu cầu</Link>
              </div>
            )}

            <div className="row g-3">
              {info.map(([label, value]) => (
                <div key={label} className="col-6 col-lg-4">
                  <div className="small text-secondary">{label}</div>
                  <div className="fw-bold">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4" style={{ maxWidth: 360 }}>
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-secondary">Còn trên kệ</span>
                <span className="fw-bold">{book.availableCopies} / {book.totalCopies} cuốn</span>
              </div>
              <div className="progress"><div className="progress-bar" style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }} /></div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5">
          <ReviewSection bookId={book._id} />
        </div>
      </div>
      <BookFormModal open={openForm} onClose={() => setOpenForm(false)} book={book} />
    </div>
  );
}
