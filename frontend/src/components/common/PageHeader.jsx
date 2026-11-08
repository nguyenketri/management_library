// Tiêu đề trang: <PageHeader title="Kho sách" subtitle="6 đầu sách" actions={<button/>} />
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="app-header d-print-none">
      <div className="container-xl d-flex flex-wrap align-items-end gap-3">
        <div className="me-auto">
          <h2 className="page-title">{title}</h2>
          {subtitle && <div className="app-header-sub">{subtitle}</div>}
        </div>
        {actions && <div className="d-flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
