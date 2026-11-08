// Người phụ trách: Người 3 (Lưu thông & báo cáo)
// TODO: lấy số liệu từ GET /api/reports/dashboard
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import BookCover from '../../components/common/BookCover';
import { BOOKS, BORROWS, BORROW_STATUS, MONTHLY_BORROWS, CURRENT_USER } from '../../constants/sampleData';

export default function DashboardPage() {
  const max = Math.max(...MONTHLY_BORROWS.map((m) => m.count));

  return (
    <>
      <PageHeader
        title={`Chào buổi sáng, ${CURRENT_USER.name.split(' ').pop()}.`}
        subtitle="Hôm nay có 3 phiếu sắp đến hạn và 1 phiếu quá hạn."
        actions={<Link to="/borrows" className="btn btn-primary">Xem phiếu mượn</Link>}
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="row g-3">
            <div className="col-6 col-lg-3"><StatCard label="Đầu sách" value={BOOKS.length} hint="+2 tuần này" highlight /></div>
            <div className="col-6 col-lg-3"><StatCard label="Cuốn trên kệ" value={22} hint="trên tổng 30 cuốn" /></div>
            <div className="col-6 col-lg-3"><StatCard label="Đang được mượn" value={8} hint="3 phiếu sắp đến hạn" /></div>
            <div className="col-6 col-lg-3"><StatCard label="Quá hạn" value={1} hint="Lê Hoàng Nam · 6 ngày" /></div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-lg-7">
              <div className="card h-100">
                <div className="card-header"><h3 className="card-title">Lượt mượn theo tháng</h3></div>
                <div className="card-body">
                  <div className="bars">
                    {MONTHLY_BORROWS.map((m, i) => (
                      <div key={m.month} className={`bars-col ${i === MONTHLY_BORROWS.length - 2 ? 'is-now' : ''}`}>
                        <span className="bars-num">{m.count}</span>
                        <div className="bars-bar" style={{ height: `${(m.count / max) * 80}%` }} />
                        <span className="bars-x">{m.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card h-100">
                <div className="card-header"><h3 className="card-title">Mượn nhiều nhất</h3></div>
                <div className="card-body py-2">
                  {BOOKS.slice(0, 4).map((b, i) => (
                    <Link key={b._id} to={`/books/${b._id}`} className="d-flex align-items-center gap-3 py-2 text-reset text-decoration-none">
                      <span className="fw-bold text-secondary" style={{ width: 18 }}>{i + 1}</span>
                      <BookCover book={b} size="sm" />
                      <div className="flex-fill text-truncate">
                        <div className="fw-bold text-truncate">{b.title}</div>
                        <div className="small text-secondary text-truncate">{b.author}</div>
                      </div>
                      <span className="stars small">★ {b.rating}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Phiếu mượn gần đây</h3>
                  <Link to="/borrows" className="ms-auto small fw-bold">Xem tất cả →</Link>
                </div>
                <div className="table-responsive">
                  <table className="table table-vcenter card-table">
                    <thead><tr><th>Bạn đọc</th><th>Sách</th><th>Ngày mượn</th><th>Hạn trả</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      {BORROWS.map((r) => (
                        <tr key={r._id}>
                          <td className="fw-bold">{r.userName}</td>
                          <td className="text-secondary">{r.bookTitle}</td>
                          <td className="text-secondary">{r.borrowDate}</td>
                          <td className="text-secondary">{r.dueDate}</td>
                          <td><StatusBadge value={r.status} map={BORROW_STATUS} /></td>
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
