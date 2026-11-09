import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import BookCover from '../../components/common/BookCover';
import { useAuth } from '../../context/AuthContext';
import reportApi from '../../api/reportApi';
import { BORROW_STATUS } from '../../constants/sampleData';

export default function DashboardPage() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    reportApi.getDashboard()
      .then(setReport)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <PageHeader
        title={`Chào buổi sáng, ${user.name.split(' ').pop()}.`}
        subtitle="Tổng quan tình hình hoạt động thư viện."
        actions={<Link to="/reports" className="btn btn-primary">Xem báo cáo</Link>}
      />
      <div className="page-body">
        <div className="container-xl">
          {error && <div className="form-error mb-3">{error}</div>}
          <div className="row g-3">
            <div className="col-6 col-lg-3"><StatCard label="Đầu sách" value={report?.books.titles ?? '—'} highlight /></div>
            <div className="col-6 col-lg-3"><StatCard label="Cuốn trên kệ" value={report?.books.availableCopies ?? '—'} hint={report ? `trên tổng ${report.books.totalCopies} cuốn` : ''} /></div>
            <div className="col-6 col-lg-3"><StatCard label="Đang được mượn" value={report?.borrows.active ?? '—'} /></div>
            <div className="col-6 col-lg-3"><StatCard label="Quá hạn" value={report?.borrows.overdue ?? '—'} /></div>
          </div>

          <div className="row g-4 mt-1">
            <div className="col-lg-5">
              <div className="card h-100">
                <div className="card-header"><h3 className="card-title">Mượn nhiều nhất</h3></div>
                <div className="card-body py-2">
                  {(report?.topBooks || []).map((book, index) => (
                    <Link key={book.bookId} to={`/books/${book.bookId}`} className="d-flex align-items-center gap-3 py-2 text-reset text-decoration-none">
                      <span className="fw-bold text-secondary" style={{ width: 18 }}>{index + 1}</span>
                      <BookCover book={{ title: book.bookTitle, color: '#d8ff5c' }} size="sm" />
                      <div className="flex-fill text-truncate">
                        <div className="fw-bold text-truncate">{book.bookTitle}</div>
                      </div>
                      <span className="small text-secondary">{book.count} lượt</span>
                    </Link>
                  ))}
                  {report && report.topBooks.length === 0 && <div className="text-center text-secondary py-4">Chưa có lượt mượn.</div>}
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card h-100">
                <div className="card-header">
                  <h3 className="card-title">Phiếu quá hạn</h3>
                  <Link to="/reports" className="ms-auto small fw-bold">Xem báo cáo →</Link>
                </div>
                <div className="table-responsive">
                  <table className="table table-vcenter card-table">
                    <thead><tr><th>Bạn đọc</th><th>Sách</th><th>Hạn trả</th><th>Quá hạn</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      {(report?.topOverdue || []).map((borrow) => (
                        <tr key={borrow._id}>
                          <td className="fw-bold">{borrow.userName}</td>
                          <td className="text-secondary">{borrow.bookTitle}</td>
                          <td className="text-secondary">{borrow.dueDate}</td>
                          <td>{borrow.overdueDays} ngày</td>
                          <td><StatusBadge value={borrow.status} map={BORROW_STATUS} /></td>
                        </tr>
                      ))}
                      {report && report.topOverdue.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-secondary py-5">Không có phiếu quá hạn.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-6 col-lg-3"><StatCard label="Độc giả" value={report?.readers.total ?? '—'} /></div>
            <div className="col-6 col-lg-3"><StatCard label="Đang có sách mượn" value={report?.readers.withActiveLoans ?? '—'} /></div>
            <div className="col-6 col-lg-3"><StatCard label="Mượn trong kỳ" value={report?.borrows.borrowedInPeriod ?? '—'} /></div>
            <div className="col-6 col-lg-3"><StatCard label="Trả trong kỳ" value={report?.borrows.returnedInPeriod ?? '—'} /></div>
          </div>
        </div>
      </div>
    </>
  );
}
