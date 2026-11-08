// Người phụ trách: Người 3 (Mượn trả & thu phạt)
// TODO: gọi borrowApi.getAll(status), lập phiếu mượn, nhận trả, thu phạt (PATCH /api/borrows/:id/pay-fine)
// Hiện đang dùng dữ liệu mẫu, các thao tác chỉ đổi trên màn hình (chưa lưu)
import { useState } from 'react';
import { IconPlus, IconCash } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import BorrowFormModal from './BorrowFormModal';
import ReturnModal from './ReturnModal';
import { BORROWS, BORROW_STATUS, FINE_STATUS, FINE_PER_DAY, TODAY } from '../../constants/sampleData';

const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
const money = (n) => n.toLocaleString('vi-VN') + 'đ';
const hasUnpaidFine = (r) => r.fine > 0 && !r.finePaid;

const TABS = [
  { key: 'all', label: 'Tất cả', match: () => true },
  { key: 'borrowed', label: 'Đang mượn', match: (r) => r.status === 'borrowed' },
  { key: 'overdue', label: 'Quá hạn', match: (r) => r.status === 'overdue' },
  { key: 'returned', label: 'Đã trả', match: (r) => r.status === 'returned' },
  { key: 'unpaid', label: 'Chưa nộp phạt', match: hasUnpaidFine },
];

// Ô "Tiền phạt": đã trả thì hiện số tiền + đã nộp / chưa nộp; đang quá hạn thì hiện số tiền đang tính
function FineCell({ borrow }) {
  if (borrow.status === 'overdue') {
    const late = Math.max(0, daysBetween(borrow.dueDate, TODAY));
    return (
      <div className="fine-cell">
        <span className="fw-bold" style={{ color: 'var(--coral)' }}>{money(late * FINE_PER_DAY)}</span>
        <span className="small text-secondary">đang tính · {late} ngày</span>
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
  const [borrows, setBorrows] = useState(BORROWS);
  const [tab, setTab] = useState('all');
  const [openForm, setOpenForm] = useState(false);
  const [returning, setReturning] = useState(null); // phiếu đang nhận trả

  const current = TABS.find((t) => t.key === tab);
  const list = borrows.filter(current.match);
  const unpaidCount = borrows.filter(hasUnpaidFine).length;

  const update = (borrow) => setBorrows(borrows.map((r) => (r._id === borrow._id ? borrow : r)));

  const handleReturned = (borrow) => {
    update(borrow);
    setReturning(null);
  };

  const handleCollectFine = (borrow) => {
    if (!window.confirm(`Xác nhận đã thu ${money(borrow.fine)} tiền mặt của ${borrow.userName}?`)) return;
    update({ ...borrow, finePaid: true, finePaidAt: TODAY });
  };

  return (
    <>
      <PageHeader
        title="Mượn / Trả"
        subtitle="Theo dõi phiếu mượn, nhận sách trả và thu tiền phạt"
        actions={<button className="btn btn-primary" type="button" onClick={() => setOpenForm(true)}><IconPlus size={17} className="me-1" /> Lập phiếu mượn</button>}
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="pill-tabs mb-4">
            {TABS.map((t) => (
              <button key={t.key} type="button" className={`pill-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
                {t.key === 'unpaid' && unpaidCount > 0 && <span className="tab-count">{unpaidCount}</span>}
              </button>
            ))}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="table table-vcenter card-table">
                <thead>
                  <tr><th>Bạn đọc</th><th>Sách</th><th>Ngày mượn</th><th>Hạn trả</th><th>Ngày trả</th><th>Trạng thái</th><th>Tiền phạt</th><th className="w-1" /></tr>
                </thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="avatar avatar-sm">{r.userName.charAt(0)}</span>
                          <span className="fw-bold">{r.userName}</span>
                        </div>
                      </td>
                      <td className="text-secondary">{r.bookTitle}</td>
                      <td className="text-secondary">{r.borrowDate}</td>
                      <td className={r.status === 'overdue' ? 'fw-bold' : 'text-secondary'} style={r.status === 'overdue' ? { color: 'var(--coral)' } : undefined}>{r.dueDate}</td>
                      <td className="text-secondary">{r.returnDate || '—'}</td>
                      <td><StatusBadge value={r.status} map={BORROW_STATUS} /></td>
                      <td><FineCell borrow={r} /></td>
                      <td>
                        {(r.status === 'borrowed' || r.status === 'overdue') && (
                          <button className="btn btn-sm btn-outline" type="button" onClick={() => setReturning(r)}>Nhận trả</button>
                        )}
                        {hasUnpaidFine(r) && (
                          <button className="btn btn-sm btn-primary text-nowrap" type="button" onClick={() => handleCollectFine(r)}>
                            <IconCash size={15} className="me-1" /> Đã thu tiền
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr><td colSpan={8} className="text-center text-secondary py-5">Không có phiếu nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <BorrowFormModal open={openForm} onClose={() => setOpenForm(false)} />
      {returning && <ReturnModal borrow={returning} onClose={() => setReturning(null)} onDone={handleReturned} />}
    </>
  );
}
