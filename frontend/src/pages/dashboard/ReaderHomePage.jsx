// Người phụ trách: Người 3 (phiếu mượn, gia hạn, tiền phạt) · Người 1 (thẻ thư viện)
// Trang chủ của ĐỘC GIẢ. TODO: gọi GET /api/borrows/my, PUT /api/borrows/:id/extend, GET /api/cards/me
import { Link } from 'react-router-dom';
import { IconClockPlus } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import BookCover from '../../components/common/BookCover';
import MemberCard from '../../components/common/MemberCard';
import { useAuth } from '../../context/AuthContext';
import { BOOKS, BORROWS, CARDS, TODAY } from '../../constants/sampleData';

const FINE_PER_DAY = 5000;
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
const money = (n) => n.toLocaleString('vi-VN') + 'đ';

export default function ReaderHomePage() {
  const { user } = useAuth();
  const card = CARDS.find((c) => c.userName === user.name); // chưa có thẻ -> undefined
  const mine = BORROWS.filter((r) => r.userName === user.name);
  const loans = mine.filter((r) => r.status !== 'returned');
  const history = mine.filter((r) => r.status === 'returned');
  const lateDays = (r) => Math.max(0, daysBetween(r.dueDate, TODAY));
  const currentFine = loans.reduce((sum, r) => sum + lateDays(r) * FINE_PER_DAY, 0);
  const lateCount = loans.filter((r) => lateDays(r) > 0).length;

  return (
    <>
      <PageHeader
        title={`Chào ${user.name.split(' ').pop()}.`}
        subtitle={`Bạn đang mượn ${loans.length}/5 cuốn${lateCount ? ` · ${lateCount} cuốn quá hạn` : ''}`}
        actions={<Link to="/books" className="btn btn-primary">Tìm sách mới</Link>}
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="row g-4">
            {/* Thẻ + số liệu */}
            <div className="col-lg-4 d-flex flex-column gap-3">
              {card ? (
                <MemberCard card={card} />
              ) : (
                <div className="stat">
                  <div className="fw-bold fs-3 mb-1">Bạn chưa có thẻ thư viện</div>
                  <div className="text-secondary">Mang thẻ sinh viên đến quầy thủ thư để được cấp thẻ và bắt đầu mượn sách.</div>
                </div>
              )}
              <div className="row g-3">
                <div className="col-6"><StatCard label="Đang mượn" value={`${loans.length}/5`} /></div>
                <div className="col-6"><StatCard label="Tiền phạt" value={money(currentFine)} hint={currentFine ? 'Trả sách để dừng tính phạt' : 'Không có'} /></div>
              </div>
            </div>

            {/* Sách đang mượn */}
            <div className="col-lg-8">
              <h3 className="mb-3">Đang mượn</h3>
              <div className="d-flex flex-column gap-3">
                {loans.map((r) => {
                  const book = BOOKS.find((b) => b._id === r.bookId) || BOOKS[0];
                  const late = lateDays(r);
                  const left = daysBetween(TODAY, r.dueDate);
                  const used = Math.min(100, (daysBetween(r.borrowDate, TODAY) / 14) * 100);
                  return (
                    <div key={r._id} className={`loan ${late ? 'is-late' : ''}`}>
                      <BookCover book={book} flat />
                      <div className="flex-fill">
                        <div className="fw-bold fs-3">{book.title}</div>
                        <div className="small text-secondary mb-3">{book.author}</div>
                        <div className="progress mb-2"><div className="progress-bar" style={{ width: `${used}%`, background: late ? 'var(--coral)' : undefined }} /></div>
                        <div className="small text-secondary">Mượn {r.borrowDate} · Hạn trả {r.dueDate}</div>
                      </div>
                      <div className="text-end d-flex flex-column justify-content-between align-items-end">
                        <div>
                          <div className="loan-days">{late ? late : left}</div>
                          <div className="small text-secondary">{late ? 'ngày quá hạn' : 'ngày còn lại'}</div>
                        </div>
                        {late
                          ? <span className="pill pill-coral">Phạt {money(late * FINE_PER_DAY)}</span>
                          : <button className="btn btn-sm btn-outline" type="button"><IconClockPlus size={16} className="me-1" /> Gia hạn 7 ngày</button>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 className="mt-5 mb-3">Đã trả</h3>
              <div className="card">
                <div className="table-responsive">
                  <table className="table table-vcenter card-table">
                    <thead><tr><th>Sách</th><th>Ngày mượn</th><th>Ngày trả</th><th>Tiền phạt</th><th className="w-1" /></tr></thead>
                    <tbody>
                      {history.map((r) => (
                        <tr key={r._id}>
                          <td className="fw-bold">{r.bookTitle}</td>
                          <td className="text-secondary">{r.borrowDate}</td>
                          <td className="text-secondary">{r.returnDate}</td>
                          <td>{r.fine ? <span className="pill pill-coral">{money(r.fine)}</span> : <span className="text-secondary">—</span>}</td>
                          <td><Link to={`/books/${r.bookId}`} className="btn btn-sm btn-ghost">Viết đánh giá</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
