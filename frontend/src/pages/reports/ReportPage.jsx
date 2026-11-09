import { useEffect, useMemo, useState } from 'react';
import { IconDownload } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import reportApi from '../../api/reportApi';
import { BORROW_STATUS } from '../../constants/sampleData';

const TABS = [
  { key: 'books', label: 'Sách' },
  { key: 'readers', label: 'Bạn đọc' },
  { key: 'borrows', label: 'Mượn / trả' },
  { key: 'overdue', label: 'Quá hạn' },
];

const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const firstOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

function Table({ columns, rows, emptyText }) {
  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row._id || `${row.bookId || row.email || row.period || 'row'}-${index}`}>
                {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : (row[column.key] ?? '—')}</td>)}
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={columns.length} className="text-center text-secondary py-5">{emptyText}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [tab, setTab] = useState('books');
  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(localToday);
  const [applied, setApplied] = useState({ from: firstOfMonth, to: localToday });
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([
      reportApi.getDashboard(applied),
      reportApi.getBooks(),
      reportApi.getReaders(applied),
      reportApi.getBorrows({ ...applied, groupBy: 'day' }),
      reportApi.getOverdue(),
    ]).then(([dashboard, books, readers, borrows, overdue]) => {
      if (active) setReports({ dashboard, books, readers, borrows, overdue });
    }).catch((err) => {
      if (active) setError(err.message);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [applied, refreshKey]);

  const currentRows = useMemo(() => {
    if (!reports) return [];
    return reports[tab]?.items || [];
  }, [reports, tab]);

  const columns = useMemo(() => {
    if (tab === 'books') return [
      { key: 'title', label: 'Tên sách' },
      { key: 'author', label: 'Tác giả' },
      { key: 'category', label: 'Danh mục' },
      { key: 'totalCopies', label: 'Tổng cuốn' },
      { key: 'availableCopies', label: 'Còn trên kệ' },
      { key: 'timesBorrowed', label: 'Lượt mượn' },
    ];
    if (tab === 'readers') return [
      { key: 'name', label: 'Bạn đọc' },
      { key: 'email', label: 'Email' },
      { key: 'borrowsInPeriod', label: 'Lượt mượn trong kỳ' },
      { key: 'activeLoans', label: 'Đang mượn' },
      { key: 'overdueLoans', label: 'Quá hạn' },
    ];
    if (tab === 'overdue') return [
      { key: 'userName', label: 'Bạn đọc' },
      { key: 'bookTitle', label: 'Sách' },
      { key: 'dueDate', label: 'Hạn trả' },
      { key: 'overdueDays', label: 'Số ngày trễ' },
      { key: 'userPhone', label: 'Điện thoại' },
    ];
    return [
      { key: 'userName', label: 'Bạn đọc' },
      { key: 'bookTitle', label: 'Sách' },
      { key: 'borrowDate', label: 'Ngày mượn' },
      { key: 'dueDate', label: 'Hạn trả' },
      { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} map={BORROW_STATUS} /> },
    ];
  }, [tab]);

  const summaryCards = useMemo(() => {
    if (!reports) return [];
    if (tab === 'books') {
      const { titles, totalCopies, availableCopies, borrowedCopies } = reports.books.summary;
      return [['Đầu sách', titles], ['Tổng số cuốn', totalCopies], ['Còn trên kệ', availableCopies], ['Đang được mượn', borrowedCopies]];
    }
    if (tab === 'readers') {
      const { total, withActiveLoans, withOverdue } = reports.readers.summary;
      return [['Bạn đọc', total], ['Đang mượn', withActiveLoans], ['Có sách quá hạn', withOverdue], ['Trong kỳ', `${applied.from} – ${applied.to}`]];
    }
    if (tab === 'overdue') {
      const { count, readersAffected, maxDays, avgDays } = reports.overdue.summary;
      return [['Phiếu quá hạn', count], ['Bạn đọc bị ảnh hưởng', readersAffected], ['Trễ lâu nhất', `${maxDays} ngày`], ['Trễ trung bình', `${avgDays} ngày`]];
    }
    const { borrowed, returned, active, overdue } = reports.borrows.summary;
    return [['Lượt mượn', borrowed], ['Lượt trả', returned], ['Đang mượn', active], ['Quá hạn', overdue]];
  }, [reports, tab, applied]);

  const exportCsv = () => {
    if (!currentRows.length) return;
    const keys = columns.map((column) => column.key);
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const content = [columns.map((column) => escape(column.label)).join(','), ...currentRows.map((row) => keys.map((key) => escape(row[key])).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-${tab}-${applied.from}-${applied.to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyFilters = () => {
    if (from && to && from > to) {
      setError('Ngày bắt đầu không được sau ngày kết thúc.');
      return;
    }
    setError('');
    setLoading(true);
    setApplied({ from, to });
    setRefreshKey((key) => key + 1);
  };

  return (
    <>
      <PageHeader
        title="Báo cáo"
        subtitle={reports ? `Dữ liệu đến ${reports.dashboard.today}` : 'Thống kê hoạt động thư viện'}
        actions={<button className="btn btn-outline" type="button" onClick={exportCsv} disabled={!currentRows.length}><IconDownload size={17} className="me-1" /> Xuất CSV</button>}
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="d-flex flex-wrap align-items-end gap-3 mb-4">
            <div className="pill-tabs me-auto">
              {TABS.map((item) => (
                <button key={item.key} type="button" className={`pill-tab ${tab === item.key ? 'active' : ''}`} onClick={() => setTab(item.key)}>{item.label}</button>
              ))}
            </div>
            <div><label className="form-label">Từ ngày</label><input type="date" className="form-control" value={from} onChange={(event) => setFrom(event.target.value)} /></div>
            <div><label className="form-label">Đến ngày</label><input type="date" className="form-control" value={to} onChange={(event) => setTo(event.target.value)} /></div>
            <button className="btn btn-primary" type="button" onClick={applyFilters}>Lọc</button>
          </div>

          {error && <div className="form-error mb-3">{error}</div>}
          {loading && <div className="text-secondary mb-3">Đang tải báo cáo…</div>}
          {reports && (
            <>
              <div className="row g-3 mb-4">
                {summaryCards.map(([label, value], index) => (
                  <div className="col-6 col-lg-3" key={label}>
                    <StatCard label={label} value={value} highlight={index === 0} />
                  </div>
                ))}
              </div>
              <Table columns={columns} rows={currentRows} emptyText="Không có dữ liệu trong báo cáo này." />
              {tab === 'borrows' && reports.borrows.timeline.length > 0 && (
                <div className="card mt-4">
                  <div className="card-header"><h3 className="card-title">Diễn biến mượn / trả</h3></div>
                  <div className="table-responsive">
                    <table className="table table-vcenter card-table">
                      <thead><tr><th>Ngày</th><th>Lượt mượn</th><th>Lượt trả</th></tr></thead>
                      <tbody>{reports.borrows.timeline.map((item) => <tr key={item.period}><td>{item.period}</td><td>{item.borrowed}</td><td>{item.returned}</td></tr>)}</tbody>
                    </table>
                  </div>
                </div>
              )}
              {tab === 'borrows' && reports.borrows.summary.returnedLate > 0 && (
                <div className="small text-secondary mt-3">{reports.borrows.summary.returnedLate} phiếu đã trả trễ trong kỳ.</div>
              )}
              {tab === 'overdue' && reports.overdue.items.length > 0 && (
                <div className="small text-secondary mt-3">Tổng tiền phạt đang phát sinh: {formatMoney(reports.overdue.items.reduce((sum, item) => sum + item.overdueDays * 5000, 0))}</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
