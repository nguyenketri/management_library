// Thẻ thư viện (dùng ở trang Thẻ thư viện + landing page)
export default function MemberCard({ card }) {
  return (
    <div className="member-card">
      <div className="d-flex justify-content-between align-items-start">
        <span className="brand">fu.library</span>
        <span className="small fw-bold">{card.cardCode}</span>
      </div>
      <div className="chip" />
      <div className="name">{card.userName}</div>
      <div className="meta">
        <span>{card.studentId}</span>
        <span>HSD {card.expiryDate}</span>
      </div>
    </div>
  );
}
