// Người phụ trách: Người 3 (Lưu thông & báo cáo)
// TODO: gọi borrowApi.getAll(status), lập phiếu mượn, trả sách, gia hạn
import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import BorrowFormModal from './BorrowFormModal';
import { BORROWS, BORROW_STATUS } from '../../constants/sampleData';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'borrowed', label: 'Đang mượn' },
  { key: 'overdue', label: 'Quá hạn' },
  { key: 'returned', label: 'Đã trả' },
];

export default function BorrowListPage() {
  const [tab, setTab] = useState('all'); // chỉ để demo giao diện tab
  const [openForm, setOpenForm] = useState(false);

  return (
    <>
      <PageHeader
        title="Mượn / Trả"
        subtitle="Theo dõi phiếu mượn và nhận sách trả"
        actions={<button className="btn btn-primary" type="button" onClick={() => setOpenForm(true)}><IconPlus size={17} className="me-1" /> Lập phiếu mượn</button>}
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="pill-tabs mb-4">
            {TABS.map((t) => (
              <button key={t.key} type="button" className={`pill-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="table table-vcenter card-table">
                <thead><tr><th>Bạn đọc</th><th>Sách</th><th>Ngày mượn</th><th>Hạn trả</th><th>Ngày trả</th><th>Trạng thái</th><th className="w-1" /></tr></thead>
                <tbody>
                  {BORROWS.map((r) => (
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
                      <td>{r.status !== 'returned' && <button className="btn btn-sm btn-outline" type="button">Nhận trả</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <BorrowFormModal open={openForm} onClose={() => setOpenForm(false)} />
    </>
  );
}
