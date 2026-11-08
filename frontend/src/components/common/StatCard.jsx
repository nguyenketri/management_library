// Thẻ số liệu: <StatCard label="Đầu sách" value={120} hint="+5 tuần này" highlight />
export default function StatCard({ label, value, hint, highlight = false }) {
  return (
    <div className={`stat ${highlight ? 'stat-lime' : ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
