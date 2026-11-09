// Người phụ trách: Người 1 (Thành viên & thẻ thư viện)
import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import userApi from '../../api/userApi';
import cardApi from '../../api/cardApi';

// Form cấp thẻ: chỉ hiện những độc giả CHƯA có thẻ
function CardForm({ onClose, onSaved }) {
  const [readers, setReaders] = useState([]);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([userApi.getAll({ role: 'member' }), cardApi.getAll()])
      .then(([members, cards]) => {
        const hasCard = new Set(cards.map((c) => c.userId?._id));
        const list = members.filter((m) => !hasCard.has(m._id));
        setReaders(list);
        setUserId(list[0]?._id || '');
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('Vui lòng chọn độc giả');
      return;
    }

    try {
      setLoading(true);
      const card = await cardApi.create(userId);
      onSaved?.(card);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ngày cấp = hôm nay, hết hạn = +1 năm (tính 1 lần khi mở form, chỉ để hiển thị)
  const [{ today, nextYear }] = useState(() => {
    const now = new Date();
    const next = new Date(now);
    next.setFullYear(now.getFullYear() + 1);
    return { today: now, nextYear: next };
  });

  return (
    <Modal
      open
      onClose={onClose}
      title="Cấp thẻ thư viện"
      width={480}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button type="submit" form="card-form" className="btn btn-primary" disabled={loading || readers.length === 0}>
            {loading ? 'Đang cấp…' : 'Cấp thẻ'}
          </button>
        </>
      }
    >
      <form id="card-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="form-error mb-3">{error}</div>}
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Độc giả</label>
            {readers.length > 0 ? (
              <Select
                value={userId}
                onChange={setUserId}
                options={readers.map((u) => ({ value: u._id, label: `${u.name} · ${u.studentId || u.email}` }))}
              />
            ) : (
              <div className="text-secondary">Tất cả độc giả đều đã có thẻ.</div>
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label">Ngày cấp</label>
            <input className="form-control" value={today.toLocaleDateString('vi-VN')} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label">Hết hạn (1 năm)</label>
            <input className="form-control" value={nextYear.toLocaleDateString('vi-VN')} disabled />
          </div>
        </div>
        <div className="form-hint mt-3">Mã thẻ được tạo tự động. Mỗi độc giả chỉ có một thẻ.</div>
      </form>
    </Modal>
  );
}

// open = false thì không hiện; mỗi lần mở là một form mới (tải lại danh sách độc giả)
export default function CardFormModal({ open, onClose, onSaved }) {
  if (!open) return null;
  return <CardForm onClose={onClose} onSaved={onSaved} />;
}
