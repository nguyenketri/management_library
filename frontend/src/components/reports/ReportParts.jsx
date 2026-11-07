import React from 'react';

// Các thành phần giao diện dùng chung cho màn hình báo cáo

export function StatCard({ label, value, hint, tone = 'light' }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value text-${tone}`}>{value}</span>
      {hint && <span className="small text-secondary">{hint}</span>}
    </div>
  );
}

export function FilterBar({ children }) {
  return <div className="toolbar justify-content-start">{children}</div>;
}

export function FilterField({ label, children }) {
  return (
    <label className="d-flex flex-column gap-1 small text-secondary mb-0">
      {label}
      {children}
    </label>
  );
}

export function DateRangeFilter({ from, to, onChange }) {
  return (
    <>
      <FilterField label="Từ ngày">
        <input type="date" value={from} max={to || undefined} onChange={(e) => onChange({ from: e.target.value, to })} />
      </FilterField>
      <FilterField label="Đến ngày">
        <input type="date" value={to} min={from || undefined} onChange={(e) => onChange({ from, to: e.target.value })} />
      </FilterField>
    </>
  );
}

export function CategorySelect({ value, categories, onChange }) {
  return (
    <FilterField label="Thể loại">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat === 'All' ? 'Tất cả thể loại' : cat}
          </option>
        ))}
      </select>
    </FilterField>
  );
}

export function SectionCard({ title, children }) {
  return (
    <div className="card bg-dark border-secondary text-light shadow-sm mb-4">
      <div className="card-header border-secondary fw-semibold">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Thanh tỉ lệ (Bootstrap progress)
export function BarRow({ label, value, max, variant = 'primary', suffix = '' }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between small mb-1">
        <span className="text-light text-truncate me-2">{label}</span>
        <span className="text-secondary text-nowrap">
          {value}
          {suffix}
        </span>
      </div>
      <div className="progress bg-secondary bg-opacity-25" style={{ height: 8 }}>
        <div className={`progress-bar bg-${variant}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function EmptyText({ text = 'Không có dữ liệu.' }) {
  return <p className="text-secondary text-center my-3 mb-0">{text}</p>;
}

export function EmptyRow({ colSpan, text = 'Không có dữ liệu.' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center text-secondary py-4">
        {text}
      </td>
    </tr>
  );
}

const STATUS_LABELS = {
  borrowed: { text: 'Đang mượn', className: 'status-tag tag-borrowed' },
  returned: { text: 'Đã trả', className: 'status-tag tag-returned' },
  overdue: { text: 'Quá hạn', className: 'status-tag bg-danger bg-opacity-25 text-danger border border-danger' },
};

export function StatusTag({ status }) {
  const info = STATUS_LABELS[status] || STATUS_LABELS.borrowed;
  return <span className={info.className}>{info.text}</span>;
}

// Trạng thái tải: nguồn dữ liệu, đang tải, lỗi
export function ReportStatus({ source, loading, error }) {
  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3 small">
        {source === 'server' ? (
          <span className="badge bg-success bg-opacity-25 text-success border border-success">🟢 Dữ liệu máy chủ</span>
        ) : (
          <span className="badge bg-warning bg-opacity-25 text-warning border border-warning">🟡 Dữ liệu offline</span>
        )}
        {loading && (
          <span className="text-secondary">
            <span className="spinner-border spinner-border-sm me-1" role="status" />
            Đang tải...
          </span>
        )}
      </div>
      {source === 'offline' && (
        <p className="small text-secondary mb-3">
          Chưa kết nối máy chủ: số liệu được tính từ dữ liệu mẫu trên trình duyệt. Nếu tab Kho Sách đang lọc thì báo
          cáo sách chỉ tính trên các sách đã lọc.
        </p>
      )}
      {error && <div className="alert alert-danger py-2">⚠️ {error}</div>}
    </>
  );
}
