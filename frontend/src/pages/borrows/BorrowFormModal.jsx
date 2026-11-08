// Người phụ trách: Người 3 (Mượn trả & thu phạt)
// TODO: lấy danh sách độc giả + sách còn trên kệ từ API, gọi borrowApi.borrow
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import { USERS, BOOKS } from '../../constants/sampleData';

export default function BorrowFormModal({ open, onClose }) {
  const readers = USERS.filter((u) => u.role === 'member');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Lập phiếu mượn"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button type="button" className="btn btn-primary">Lập phiếu</button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label">Bạn đọc</label>
          <Select options={readers.map((u) => ({ value: u._id, label: `${u.name} · ${u.studentId}` }))} />
        </div>
        <div className="col-12">
          <label className="form-label">Sách</label>
          <Select
            options={BOOKS.map((b) => ({
              value: b._id,
              label: `${b.title} ${b.availableCopies === 0 ? '(hết sách)' : `(còn ${b.availableCopies})`}`,
              disabled: b.availableCopies === 0,
            }))}
          />
        </div>
        <div className="col-md-6"><label className="form-label">Ngày mượn</label><input type="date" className="form-control" defaultValue="2026-11-08" /></div>
        <div className="col-md-6"><label className="form-label">Hạn trả (14 ngày)</label><input type="date" className="form-control" defaultValue="2026-11-22" /></div>
        <div className="col-12"><label className="form-label">Ghi chú</label><input className="form-control" placeholder="Không bắt buộc" /></div>
      </div>
      <div className="form-hint mt-3">Chỉ cho mượn khi thẻ còn hạn và bạn đọc đang mượn dưới 5 cuốn.</div>
    </Modal>
  );
}
