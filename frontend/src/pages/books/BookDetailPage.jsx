// Người phụ trách: Người 2 (Kho sách)
// TODO: gọi bookApi.getById(id)
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import BookCover from '../../components/common/BookCover';
import ReviewSection from './ReviewSection';
import BookFormModal from './BookFormModal';
import { BOOKS, getCurrentUser } from '../../constants/sampleData';
import { isStaff } from '../../constants/menu';

export default function BookDetailPage() {
  const { id } = useParams();
  const book = BOOKS.find((b) => b._id === id) || BOOKS[0];
  const [openForm, setOpenForm] = useState(false);
  const staff = isStaff(getCurrentUser().role);

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
                <span className={`pill ${book.availableCopies ? 'pill-lime' : 'pill-coral'}`}>
                  {book.availableCopies ? 'Còn trên kệ · đến quầy thủ thư để mượn' : 'Đã hết sách'}
                </span>
              )}
            </div>

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
