// Người phụ trách: Người 3 (phiếu mượn, gia hạn, tiền phạt) · Người 1 (thẻ thư viện)
// Trang chủ của ĐỘC GIẢ. TODO (Người 3): gọi GET /api/borrows/my, PUT /api/borrows/:id/extend
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconClockPlus } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import BookCover from '../../components/common/BookCover';
import MemberCard from '../../components/common/MemberCard';
import { useAuth } from '../../context/AuthContext';
import cardApi from '../../api/cardApi';
import StatusBadge from '../../components/common/StatusBadge';
import { BOOKS, BORROWS, TODAY, FINE_PER_DAY, FINE_STATUS } from '../../constants/sampleData';

const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
const money = (n) => n.toLocaleString('vi-VN') + 'đ';

export default function ReaderHomePage() {
  const { user } = useAuth();
  const [card, setCard] = useState(null); // null = chưa có thẻ

  // Thẻ thư viện của độc giả (Người 1) – chưa có thẻ thì API trả 404
  useEffect(() => {
    cardApi.getMe().then(setCard).catch(() => setCard(null));
  }, []);

  const mine = BORROWS.filter((r) => r.userName === user.name);
  const loans = mine.filter((r) => r.status !== 'returned');
  const history = mine.filter((r) => r.status === 'returned');
  const lateDays = (r) => Math.max(0, daysBetween(r.dueDate, TODAY));
  const currentFine = loans.reduce((sum, r) => sum + lateDays(r) * FINE_PER_DAY, 0); // phạt đang tính (sách chưa trả)
  const unpaidFine = history.reduce((sum, r) => sum + (r.fine > 0 && !r.finePaid ? r.fine : 0), 0); // đã trả nhưng chưa nộp
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
                <>
                  <MemberCard card={card} />
                  {card.currentStatus === 'locked' && (
                    <div className="form-error">Thẻ của bạn đang bị khóa nên tạm thời không mượn được sách. Vui lòng liên hệ quầy thủ thư.</div>
                  )}
                  {card.currentStatus === 'expired' && (
                    <div className="form-error">Thẻ đã hết hạn. Mang thẻ sinh viên đến quầy thủ thư để gia hạn.</div>
                  )}
                </>
              ) : (
                <div className="stat">
                  <div className="fw-bold fs-3 mb-1">Bạn chưa có thẻ thư viện</div>
                  <div className="text-secondary">Mang thẻ sinh viên đến quầy thủ thư để được cấp thẻ và bắt đầu mượn sách.</div>
                </div>
              )}
              <div className="row g-3">
                <div className="col-6"><StatCard label="Đang mượn" value={`${loans.length}/5`} /></div>
                <div className="col-6">
                  <StatCard
                    label="Phạt chưa nộp"
                    value={money(unpaidFine)}
                    hint={currentFine ? `+ ${money(currentFine)} đang tính` : unpaidFine ? 'Nộp tại quầy thủ thư' : 'Không có'}
                  />
                </div>
              </div>

              {/* Nhắc nộp phạt: tiền mặt tại quầy, chưa nộp thì không đặt mượn được */}
              {unpaidFine > 0 && (
                <div className="fine-box">
                  <div className="fw-bold mb-1">Bạn còn nợ phạt {money(unpaidFine)}</div>
                  <div className="small">Vui lòng nộp tiền mặt tại quầy thủ thư. Chưa nộp thì chưa đặt mượn được sách mới.</div>
                </div>
              )}
              {currentFine > 0 && (
                <div className="fine-box">
                  <div className="fw-bold mb-1">Có sách quá hạn – phạt đang tính {money(currentFine)}</div>
                  <div className="small">Mỗi ngày trễ thêm {money(FINE_PER_DAY)}. Trả sách sớm để dừng tính phạt, tiền phạt nộp tại quầy khi trả.</div>
                </div>
              )}
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
                          <td>
                            {r.fine > 0 ? (
                              <div className="fine-cell">
                                <span className="fw-bold">{money(r.fine)}</span>
                                <StatusBadge value={r.finePaid ? 'paid' : 'unpaid'} map={FINE_STATUS} />
                              </div>
                            ) : <span className="text-secondary">—</span>}
                          </td>
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
