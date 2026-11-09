// Huy hiệu trạng thái: <StatusBadge value="overdue" map={BORROW_STATUS} />
// map có dạng { key: { label, color } } — color: lime | coral | sky | lilac | amber | mint | muted
export default function StatusBadge({ value, map }) {
  const item = map[value] || { label: value, color: 'muted' };
  return <span className={`pill pill-${item.color}`}>{item.label}</span>;
}
