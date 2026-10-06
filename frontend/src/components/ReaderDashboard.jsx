import React from 'react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

export default function ReaderDashboard({ currentUser, books, borrows, onQuickBorrow, onExtendBorrow }) {
  if (!currentUser || currentUser.role !== 'member') return null;

  const myBorrows = borrows.filter((b) => b.userId === currentUser._id);
  const activeBorrows = myBorrows.filter((b) => b.status === 'borrowed');
  const history = [...myBorrows].sort(
    (a, b) => new Date(b.createdAt || b.borrowDate) - new Date(a.createdAt || a.borrowDate)
  );

  const penaltyTotal = myBorrows.reduce((sum, record) => {
    if (!record.dueDate) return sum;
    const due = new Date(record.dueDate);
    const end = record.returnDate ? new Date(record.returnDate) : new Date();
    const overdueDays = Math.max(0, Math.ceil((end - due) / (1000 * 60 * 60 * 24)));
    return sum + (overdueDays > 0 ? overdueDays * 5000 : 0);
  }, 0);

  const overdueCount = activeBorrows.filter((b) => new Date(b.dueDate) < new Date()).length;

  return (
    <div className="mb-4">
      <div className="card bg-dark border-secondary text-light shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: 72, height: 72, fontSize: '1.8rem' }}
              >
                {currentUser.name?.charAt(0) || 'U'}
              </div>

              <div>
                <div className="text-secondary small text-uppercase tracking-wide">Thông tin cá nhân</div>
                <h3 className="mb-1 fw-bold text-light">{currentUser.name}</h3>
                <div className="text-secondary">
                  {currentUser.roleLabel || 'Độc giả'} • {currentUser.studentId || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-primary px-3 py-2">MEMBER</span>
              <span className="badge bg-danger px-3 py-2">{overdueCount} quá hạn</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-primary bg-dark text-light h-100 shadow-sm">
            <div className="card-body">
              <div className="text-secondary small mb-2">Sách đang mượn</div>
              <div className="fs-3 fw-bold text-primary">{activeBorrows.length}</div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-warning bg-dark text-light h-100 shadow-sm">
            <div className="card-body">
              <div className="text-secondary small mb-2">Quá hạn</div>
              <div className="fs-3 fw-bold text-warning">{overdueCount}</div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-danger bg-dark text-light h-100 shadow-sm">
            <div className="card-body">
              <div className="text-secondary small mb-2">Tổng tiền phạt</div>
              <div className="fs-5 fw-bold text-danger">{formatCurrency(penaltyTotal)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-secondary bg-dark text-light h-100">
            <div className="card-header bg-secondary bg-opacity-25 border-secondary d-flex justify-content-between align-items-center">
              <span className="fw-semibold">📖 Sách đang mượn</span>
              <span className="small text-secondary">{activeBorrows.length} cuốn</span>
            </div>
            <div className="card-body">
              {activeBorrows.length === 0 ? (
                <div className="text-secondary">Bạn chưa mượn quyển sách nào.</div>
              ) : (
                <div className="d-grid gap-3">
                  {activeBorrows.map((record) => {
                    const isLate = new Date(record.dueDate) < new Date();
                    const book = books.find((b) => b._id === record.bookId);
                    return (
                      <div key={record._id} className="border border-secondary rounded p-3 bg-black bg-opacity-10">
                        <div className="d-flex justify-content-between gap-3 align-items-start flex-wrap">
                          <div>
                            <div className="fw-bold text-light">{record.bookTitle}</div>
                            <div className="small text-secondary mt-1">
                              Hạn trả: <strong>{formatDate(record.dueDate)}</strong>
                            </div>
                          </div>
                          <span className={`badge ${isLate ? 'bg-danger' : 'bg-success'} px-2 py-1`}>
                            {isLate ? 'Quá hạn' : 'Đang mượn'}
                          </span>
                        </div>

                        {book && (
                          <div className="small text-secondary mt-2">
                            Tác giả: {book.author} · Thể loại: {book.category}
                          </div>
                        )}

                        <div className="mt-3 d-flex gap-2 flex-wrap">
                          <button className="btn btn-primary btn-sm" onClick={() => onExtendBorrow(record._id)}>
                            Gia hạn +7 ngày
                          </button>
                          <button className="btn btn-outline-light btn-sm" onClick={() => onQuickBorrow(book)} disabled={!book}>
                            Mượn thêm
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-secondary bg-dark text-light h-100">
            <div className="card-header bg-secondary bg-opacity-25 border-secondary d-flex justify-content-between align-items-center">
              <span className="fw-semibold">🕘 Lịch sử mượn</span>
              <span className="small text-secondary">{history.length} giao dịch</span>
            </div>
            <div className="card-body">
              {history.length === 0 ? (
                <div className="text-secondary">Chưa có lịch sử mượn nào.</div>
              ) : (
                <div className="d-grid gap-2">
                  {history.slice(0, 6).map((record) => (
                    <div key={record._id} className="border-bottom border-secondary pb-2">
                      <div className="fw-semibold small">{record.bookTitle}</div>
                      <div className="small text-secondary">
                        {record.borrowDate ? formatDate(record.borrowDate) : '—'} → {record.returnDate ? formatDate(record.returnDate) : 'Chưa trả'}
                      </div>
                      <div className="small text-secondary">
                        Trạng thái: <span className={record.status === 'returned' ? 'text-success' : 'text-warning'}>{record.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-secondary bg-dark text-light mt-4">
        <div className="card-header bg-secondary bg-opacity-25 border-secondary">
          <span className="fw-semibold">💸 Chi tiết tiền phạt</span>
        </div>
        <div className="card-body">
          {myBorrows.length === 0 ? (
            <div className="text-secondary">Chưa có dữ liệu phạt.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-borderless align-middle mb-0">
                <thead>
                  <tr className="text-secondary small">
                    <th>Sách</th>
                    <th>Hạn trả</th>
                    <th>Trạng thái</th>
                    <th className="text-end">Phạt</th>
                  </tr>
                </thead>
                <tbody>
                  {myBorrows.map((record) => {
                    const due = record.dueDate ? new Date(record.dueDate) : null;
                    const end = record.returnDate ? new Date(record.returnDate) : new Date();
                    const overdueDays = due ? Math.max(0, Math.ceil((end - due) / (1000 * 60 * 60 * 24))) : 0;
                    const penalty = overdueDays > 0 ? overdueDays * 5000 : 0;

                    return (
                      <tr key={record._id}>
                        <td>{record.bookTitle}</td>
                        <td>{formatDate(record.dueDate)}</td>
                        <td>
                          <span className={penalty > 0 ? 'text-danger' : 'text-success'}>
                            {penalty > 0 ? `${overdueDays} ngày quá hạn` : 'Không phạt'}
                          </span>
                        </td>
                        <td className="text-end fw-bold text-danger">{formatCurrency(penalty)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
