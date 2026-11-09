import { CARD_STATUS } from '../../constants/sampleData';

// Thẻ thư viện (trang Thẻ thư viện, Sách của tôi, landing page)
// Nhận được cả thẻ từ API (userId đã populate, có currentStatus) lẫn thẻ trong dữ liệu mẫu
export default function MemberCard({ card }) {
  const name = card.userId?.name ?? card.userName;
  const studentId = card.userId?.studentId ?? card.studentId;
  const expiry = new Date(card.expiryDate).toLocaleDateString('vi-VN');
  const status = card.currentStatus ?? card.status ?? 'active';
  const inactive = status !== 'active';

  return (
    <div className={`member-card ${inactive ? 'is-inactive' : ''}`}>
      <div className="d-flex justify-content-between align-items-start">
        <span className="brand">fu.library</span>
        <span className="small fw-bold">{card.cardCode}</span>
      </div>
      <div className="d-flex align-items-end gap-2">
        <div className="chip" />
        <span className="card-type">Thẻ bạn đọc</span>
      </div>
      {/* Thẻ bị khóa / hết hạn: hiện nhãn lớn đè lên thẻ */}
      {inactive && <span className="member-card-stamp">{CARD_STATUS[status]?.label}</span>}
      <div className="name">{name}</div>
      <div className="meta">
        <span>{studentId || '—'}</span>
        <span>HSD {expiry}</span>
      </div>
    </div>
  );
}
