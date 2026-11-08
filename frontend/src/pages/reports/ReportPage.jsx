// Người phụ trách: Người 3 (Lưu thông & báo cáo)
// TODO: gọi /api/reports/books | readers | borrows | overdue theo tab + bộ lọc ngày
import { useState } from 'react';
import { IconDownload } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { BOOKS, BORROWS, BORROW_STATUS } from '../../constants/sampleData';

const TABS = ['Sách', 'Bạn đọc', 'Mượn / trả', 'Quá hạn'];

export default function ReportPage() {
  const [tab, setTab] = useState(0); // chỉ để demo giao diện tab

  return (
    <>
      <PageHeader
        title="Báo cáo"
        subtitle="Tháng 11/2026"
        actions={<button className="btn btn-outline" type="button"><IconDownload size={17} className="me-1" /> Xuất file</button>}
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="d-flex flex-wrap align-items-end gap-3 mb-4">
            <div className="pill-tabs me-auto">
              {TABS.map((t, i) => (
                <button key={t} type="button" className={`pill-tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
              ))}
            </div>
            <div><label className="form-label">Từ ngày</label><input type="date" className="form-control" /></div>
            <div><label className="form-label">Đến ngày</label><input type="date" className="form-control" /></div>
            <button className="btn btn-primary" type="button">Lọc</button>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3"><StatCard label="Phiếu mượn" value={41} highlight /></div>
            <div className="col-6 col-lg-3"><StatCard label="Đã trả" value={33} /></div>
            <div className="col-6 col-lg-3"><StatCard label="Đúng hạn" value="92%" /></div>
            <div className="col-6 col-lg-3"><StatCard label="Tiền phạt" value="45k" /></div>
          </div>

          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card h-100">
                <div className="card-body">
                  <h3 className="card-title mb-4">Mức độ được mượn</h3>
                  {BOOKS.map((b) => {
                    const pct = Math.round(((b.totalCopies - b.availableCopies) / b.totalCopies) * 100);
                    return (
                      <div key={b._id} className="mb-3">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="text-truncate fw-bold">{b.title}</span>
                          <span className="text-secondary">{pct}%</span>
                        </div>
                        <div className="progress"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="card h-100">
                <div className="table-responsive">
                  <table className="table table-vcenter card-table">
                    <thead><tr><th>Bạn đọc</th><th>Sách</th><th>Hạn trả</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      {BORROWS.map((r) => (
                        <tr key={r._id}>
                          <td className="fw-bold">{r.userName}</td>
                          <td className="text-secondary">{r.bookTitle}</td>
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
