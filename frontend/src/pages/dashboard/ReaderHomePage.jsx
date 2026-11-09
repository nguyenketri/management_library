import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconClockPlus } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import BookCover from '../../components/common/BookCover';
import MemberCard from '../../components/common/MemberCard';
import { useAuth } from '../../context/AuthContext';
import cardApi from '../../api/cardApi';
import borrowApi from '../../api/borrowApi';
import StatusBadge from '../../components/common/StatusBadge';
import { BORROW_STATUS, FINE_PER_DAY, FINE_STATUS } from '../../constants/sampleData';

const localToday = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
const money = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

export default function ReaderHomePage() {
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [borrows, setBorrows] = useState([]);
  const [error, setError] = useState('');
  const [renewing, setRenewing] = useState('');
  const [cancelling, setCancelling] = useState('');
  const today = localToday();

  useEffect(() => {
    cardApi.getMe().then(setCard).catch(() => setCard(null));
    borrowApi.getMyBorrows()
      .then(setBorrows)
      .catch((err) => setError(err.message));
  }, []);

  const loans = borrows.filter((borrow) => ['borrowed', 'overdue'].includes(borrow.status));
  const history = borrows.filter((borrow) => borrow.status === 'returned');
  const requests = borrows.filter((borrow) => ['pending', 'rejected'].includes(borrow.status));
  const lateDays = (borrow) => borrow.status === 'overdue' ? Math.max(0, daysBetween(borrow.dueDate, today)) : 0;
  const currentFine = loans.reduce((sum, borrow) => sum + (borrow.status === 'overdue' ? borrow.fine || lateDays(borrow) * FINE_PER_DAY : 0), 0);
  const unpaidFine = history.reduce((sum, borrow) => sum + (borrow.fine > 0 && !borrow.finePaid ? borrow.fine : 0), 0);
  const lateCount = loans.filter((borrow) => borrow.status === 'overdue' || lateDays(borrow) > 0).length;

  const handleExtend = async (borrow) => {
    if (!window.confirm(`Gia hạn sách "${borrow.bookTitle}" thêm 7 ngày?`)) return;
    setRenewing(borrow._id);
    setError('');
    try {
      const updated = await borrowApi.extend(borrow._id);
      setBorrows((items) => items.map((item) => item._id === updated._id ? updated : item));
    } catch (err) {
      setError(err.message);
    } finally {
      setRenewing('');
    }
  };

  const handleCancelRequest = async (borrow) => {
    if (!window.confirm(`Hủy yêu cầu mượn "${borrow.bookTitle}"?`)) return;
    setCancelling(borrow._id);
    setError('');
    try {
      await borrowApi.cancelRequest(borrow._id);
      setBorrows((items) => items.filter((item) => item._id !== borrow._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling('');
    }
  };

  return (
    <>
      <PageHeader
        title={`Chào ${user.name.split(' ').pop()}.`}
        subtitle={`Bạn đang mượn ${loans.length}/5 cuốn${lateCount ? ` · ${lateCount} cuốn quá hạn` : ''}`}
        actions={<Link to="/books" className="btn btn-primary">Tìm sách mới</Link>}
      />
      <div className="page-body">
        <div className="container-xl">
          {error && <div className="form-error mb-3">{error}</div>}
          <div className="row g-4">
            <div className="col-lg-4 d-flex flex-column gap-3">
              {card ? (
                <>
                  <MemberCard card={card} />
                  {card.currentStatus === 'locked' && <div className="form-error">Thẻ của bạn đang bị khóa nên tạm thời không mượn được sách. Vui lòng liên hệ quầy thủ thư.</div>}
                  {card.currentStatus === 'expired' && <div className="form-error">Thẻ đã hết hạn. Mang thẻ sinh viên đến quầy thủ thư để gia hạn.</div>}
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
              {unpaidFine > 0 && (
                <div className="fine-box">
                  <div className="fw-bold mb-1">Bạn còn nợ phạt {money(unpaidFine)}</div>
                  <div className="small">Vui lòng nộp tiền mặt tại quầy thủ thư. Chưa nộp thì chưa thể mượn sách mới.</div>
                </div>
              )}
              {currentFine > 0 && (
                <div className="fine-box">
                  <div className="fw-bold mb-1">Có sách quá hạn – phạt đang tính {money(currentFine)}</div>
                  <div className="small">Mỗi ngày trễ thêm {money(FINE_PER_DAY)}. Trả sách sớm để dừng tính phạt, tiền phạt nộp tại quầy khi trả.</div>
                </div>
              )}
            </div>

            <div className="col-lg-8">
              <h3 className="mb-3">Đang mượn</h3>
              <div className="d-flex flex-column gap-3">
                {loans.map((borrow) => {
                  const late = lateDays(borrow);
                  const left = daysBetween(today, borrow.dueDate);
                  const elapsedDays = Math.max(0, daysBetween(borrow.borrowDate, today));
                  const used = Math.min(100, (elapsedDays / 14) * 100);
                  const book = { title: borrow.bookTitle, author: '', color: '#d8ff5c' };
                  return (
                    <div key={borrow._id} className={`loan ${late ? 'is-late' : ''}`}>
                      <BookCover book={book} flat />
                      <div className="flex-fill">
                        <div className="fw-bold fs-3">{borrow.bookTitle}</div>
                        <div className="progress mb-2"><div className="progress-bar" style={{ width: `${used}%`, background: late ? 'var(--coral)' : undefined }} /></div>
                        <div className="small text-secondary">Mượn {borrow.borrowDate} · Hạn trả {borrow.dueDate}</div>
                      </div>
                      <div className="text-end d-flex flex-column justify-content-between align-items-end">
                        <div>
                          <div className="loan-days">{late ? late : left}</div>
                          <div className="small text-secondary">{late ? 'ngày quá hạn' : 'ngày còn lại'}</div>
                        </div>
                        {late ? (
                          <span className="pill pill-coral">Phạt {money(borrow.fine || late * FINE_PER_DAY)}</span>
                        ) : borrow.renewalCount >= 1 ? (
                          <span className="small text-secondary">Đã gia hạn</span>
                        ) : (
                          <button className="btn btn-sm btn-outline" type="button" disabled={renewing === borrow._id} onClick={() => handleExtend(borrow)}>
                            <IconClockPlus size={16} className="me-1" /> {renewing === borrow._id ? 'Đang gia hạn…' : 'Gia hạn 7 ngày'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {loans.length === 0 && <div className="text-secondary py-4">Bạn chưa có sách đang mượn.</div>}
              </div>

              <h3 className="mt-5 mb-3">Đã trả</h3>
              <div className="card">
                <div className="table-responsive">
                  <table className="table table-vcenter card-table">
                    <thead><tr><th>Sách</th><th>Ngày mượn</th><th>Ngày trả</th><th>Tiền phạt</th><th className="w-1" /></tr></thead>
                    <tbody>
                      {history.map((borrow) => (
                        <tr key={borrow._id}>
                          <td className="fw-bold">{borrow.bookTitle}</td>
                          <td className="text-secondary">{borrow.borrowDate}</td>
                          <td className="text-secondary">{borrow.returnDate}</td>
                          <td>
                            {borrow.fine > 0 ? (
                              <div className="fine-cell">
                                <span className="fw-bold">{money(borrow.fine)}</span>
                                <StatusBadge value={borrow.finePaid ? 'paid' : 'unpaid'} map={FINE_STATUS} />
                                {!borrow.finePaid && <span className="small text-secondary">Vui lòng nộp tại quầy thủ thư</span>}
                              </div>
                            ) : <span className="text-secondary">—</span>}
                          </td>
                          <td><Link to={`/books/${borrow.bookId}`} className="btn btn-sm btn-ghost">Viết đánh giá</Link></td>
                        </tr>
                      ))}
                      {history.length === 0 && <tr><td colSpan={5} className="text-center text-secondary py-5">Chưa có lịch sử trả sách.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              {requests.length > 0 && (
                <>
                  <h3 className="mt-5 mb-3">Yêu cầu mượn</h3>
                  <div className="card">
                    <div className="table-responsive">
                      <table className="table table-vcenter card-table">
                        <thead><tr><th>Sách</th><th>Ngày yêu cầu</th><th>Trạng thái</th><th>Lý do</th><th className="w-1" /></tr></thead>
                        <tbody>{requests.map((borrow) => (
                          <tr key={borrow._id}>
                            <td className="fw-bold">{borrow.bookTitle}</td>
                            <td className="text-secondary">{borrow.requestDate || borrow.createdAt?.slice(0, 10) || '—'}</td>
                            <td><StatusBadge value={borrow.status} map={BORROW_STATUS} /></td>
                            <td className="text-secondary">{borrow.rejectReason || '—'}</td>
                            <td>{borrow.status === 'pending' && (
                              <button className="btn btn-sm btn-outline" type="button" disabled={cancelling === borrow._id} onClick={() => handleCancelRequest(borrow)}>
                                {cancelling === borrow._id ? 'Đang hủy…' : 'Hủy yêu cầu'}
                              </button>
                            )}</td>
                          </tr>
                        ))}{requests.length === 0 && <tr><td colSpan={5} className="text-center text-secondary py-4">Chưa có yêu cầu mượn nào.</td></tr>}</tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
