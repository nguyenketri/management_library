import { useCallback, useEffect, useState } from 'react';
import { IconPlus, IconCash, IconRefresh } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import BorrowFormModal from './BorrowFormModal';
import ReturnModal from './ReturnModal';
import borrowApi from '../../api/borrowApi';
import { BORROW_STATUS, FINE_STATUS, FINE_PER_DAY } from '../../constants/sampleData';

const localToday = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
const money = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;
const hasUnpaidFine = (borrow) => borrow.status === 'returned' && borrow.fine > 0 && !borrow.finePaid;

const TABS = [
  { key: 'all', label: 'Tất cả', match: () => true },
  { key: 'pending', label: 'Chờ duyệt', match: (borrow) => borrow.status === 'pending' },
  { key: 'borrowed', label: 'Đang mượn', match: (borrow) => borrow.status === 'borrowed' },
  { key: 'overdue', label: 'Quá hạn', match: (borrow) => borrow.status === 'overdue' },
  { key: 'returned', label: 'Đã trả', match: (borrow) => borrow.status === 'returned' },
  { key: 'unpaid', label: 'Chưa nộp phạt', match: hasUnpaidFine },
];

function FineCell({ borrow }) {
  if (borrow.status === 'overdue') {
    const lateDays = Math.max(0, daysBetween(borrow.dueDate, localToday()));
    return (
      <div className="fine-cell">
        <span className="fw-bold" style={{ color: 'var(--coral)' }}>{money(borrow.fine || lateDays * FINE_PER_DAY)}</span>
        <span className="small text-secondary">đang tính · {lateDays} ngày</span>
      </div>
    );
  }
  if (borrow.fine > 0) {
    return (
      <div className="fine-cell">
        <span className="fw-bold">{money(borrow.fine)}</span>
        <StatusBadge value={borrow.finePaid ? 'paid' : 'unpaid'} map={FINE_STATUS} />
      </div>
    );
  }
  return <span className="text-secondary">—</span>;
}

export default function BorrowListPage() {
  const [borrows, setBorrows] = useState([]);
  const [tab, setTab] = useState('pending');
  const [openForm, setOpenForm] = useState(false);
  const [returning, setReturning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collecting, setCollecting] = useState('');
  const [processingRequest, setProcessingRequest] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadBorrows = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    try {
      setBorrows(await borrowApi.getAll());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => loadBorrows(), 0);
    const intervalId = window.setInterval(() => loadBorrows(true), 15000);
    const handleFocus = () => loadBorrows(true);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadBorrows]);

  const current = TABS.find((item) => item.key === tab);
  const list = borrows.filter(current.match);
  const pendingCount = borrows.filter((borrow) => borrow.status === 'pending').length;
  const unpaidCount = borrows.filter(hasUnpaidFine).length;

  const handleCreated = (borrow) => setBorrows((items) => [borrow, ...items]);
  const handleReturned = (borrow) => setBorrows((items) => items.map((item) => item._id === borrow._id ? borrow : item));

  const handleApprove = async (borrow) => {
    setProcessingRequest(borrow._id);
    setError('');
    try {
      handleReturned(await borrowApi.approve(borrow._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingRequest('');
    }
  };

  const handleReject = async (borrow) => {
    const reason = window.prompt(`Lý do từ chối yêu cầu mượn "${borrow.bookTitle}":`);
    if (!reason?.trim()) return;
    setProcessingRequest(borrow._id);
    setError('');
    try {
      handleReturned(await borrowApi.reject(borrow._id, reason.trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingRequest('');
    }
  };

  const handleCollectFine = async (borrow) => {
    if (!window.confirm(`Xác nhận đã thu ${money(borrow.fine)} tiền mặt của ${borrow.userName}?`)) return;
    setCollecting(borrow._id);
    setError('');
    try {
      handleReturned(await borrowApi.payFine(borrow._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setCollecting('');
    }
  };

  return (
    <>
      <PageHeader
        title="Mượn / Trả"
        subtitle="Theo dõi yêu cầu chờ duyệt, nhận sách trả và thu tiền phạt"
        actions={(
          <>
            <button className="btn btn-outline" type="button" onClick={() => loadBorrows(true)} disabled={refreshing}>
              <IconRefresh size={17} className="me-1" /> {refreshing ? 'Đang tải…' : 'Làm mới'}
            </button>
            <button className="btn btn-primary" type="button" onClick={() => setOpenForm(true)}><IconPlus size={17} className="me-1" /> Lập phiếu mượn</button>
          </>
        )}
      />
      <div className="page-body">
        <div className="container-xl">
          {error && <div className="form-error mb-3">{error}</div>}
          {pendingCount > 0 && (
            <div className="form-success mb-3" role="status" aria-live="polite">
              Có <strong>{pendingCount}</strong> yêu cầu đặt mượn đang chờ duyệt. Màn hình tự cập nhật mỗi 15 giây.
            </div>
          )}
          <div className="pill-tabs mb-4">
            {TABS.map((item) => (
              <button key={item.key} type="button" className={`pill-tab ${tab === item.key ? 'active' : ''}`} onClick={() => setTab(item.key)}>
                {item.label}
                {item.key === 'pending' && pendingCount > 0 && <span className="tab-count">{pendingCount}</span>}
                {item.key === 'unpaid' && unpaidCount > 0 && <span className="tab-count">{unpaidCount}</span>}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="table table-vcenter card-table">
                <thead>
                  <tr><th>Bạn đọc</th><th>Sách</th><th>Ngày đặt / mượn</th><th>Hạn trả</th><th>Ngày trả</th><th>Trạng thái</th><th>Tiền phạt</th><th className="w-1" /></tr>
                </thead>
                <tbody>
                  {list.map((borrow) => (
                    <tr key={borrow._id}>
                      <td><div className="d-flex align-items-center gap-2"><span className="avatar avatar-sm">{borrow.userName?.charAt(0)}</span><span className="fw-bold">{borrow.userName}</span></div></td>
                      <td className="text-secondary">{borrow.bookTitle}</td>
                      <td className="text-secondary">{borrow.borrowDate || borrow.requestDate || '—'}</td>
                      <td className={borrow.status === 'overdue' ? 'fw-bold' : 'text-secondary'} style={borrow.status === 'overdue' ? { color: 'var(--coral)' } : undefined}>{borrow.dueDate}</td>
                      <td className="text-secondary">{borrow.returnDate || '—'}</td>
                      <td><StatusBadge value={borrow.status} map={BORROW_STATUS} /></td>
                      <td><FineCell borrow={borrow} /></td>
                      <td>
                        {borrow.status === 'pending' && (
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-primary text-nowrap" type="button" disabled={processingRequest === borrow._id} onClick={() => handleApprove(borrow)}>
                              {processingRequest === borrow._id ? 'Đang xử lý…' : 'Duyệt'}
                            </button>
                            <button className="btn btn-sm btn-outline text-nowrap" type="button" disabled={processingRequest === borrow._id} onClick={() => handleReject(borrow)}>Từ chối</button>
                          </div>
                        )}
                        {(borrow.status === 'borrowed' || borrow.status === 'overdue') && (
                          <button className="btn btn-sm btn-outline" type="button" onClick={() => setReturning(borrow)}>Nhận trả</button>
                        )}
                        {hasUnpaidFine(borrow) && (
                          <button className="btn btn-sm btn-primary text-nowrap" type="button" disabled={collecting === borrow._id} onClick={() => handleCollectFine(borrow)}>
                            <IconCash size={15} className="me-1" /> {collecting === borrow._id ? 'Đang xử lý…' : 'Đã thu tiền'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && list.length === 0 && <tr><td colSpan={8} className="text-center text-secondary py-5">Không có phiếu nào</td></tr>}
                  {loading && <tr><td colSpan={8} className="text-center text-secondary py-5">Đang tải phiếu mượn…</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <BorrowFormModal open={openForm} onClose={() => setOpenForm(false)} onCreated={handleCreated} />
      {returning && (
        <ReturnModal
          borrow={returning}
          onClose={() => setReturning(null)}
          onDone={handleReturned}
        />
      )}
    </>
  );
}
