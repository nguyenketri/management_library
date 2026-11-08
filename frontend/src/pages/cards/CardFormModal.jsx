// Người phụ trách: Người 1 (Thành viên & thẻ thư viện)
// TODO: lấy độc giả chưa có thẻ từ API, gọi cardApi.create
import Modal from '../../components/common/Modal';
import { USERS } from '../../constants/sampleData';

export default function CardFormModal({ open, onClose }) {
  const readers = USERS.filter((u) => u.role === 'member');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cấp thẻ thư viện"
      width={480}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button type="button" className="btn btn-primary">Cấp thẻ</button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Độc giả</label>
          <select className="form-select">
            {readers.map((u) => <option key={u._id}>{u.name} · {u.studentId}</option>)}
          </select>
        </div>
        <div className="col-md-6"><label className="form-label">Ngày cấp</label><input type="date" className="form-control" defaultValue="2026-11-08" /></div>
        <div className="col-md-6"><label className="form-label">Hết hạn (1 năm)</label><input type="date" className="form-control" defaultValue="2027-11-08" /></div>
      </div>
      <div className="form-hint mt-3">Mã thẻ được tạo tự động. Mỗi độc giả chỉ có một thẻ.</div>
    </Modal>
  );
}
