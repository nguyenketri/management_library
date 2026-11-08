// Người phụ trách: Người 1 (Thành viên & thẻ thư viện)
// TODO: điền sẵn dữ liệu khi sửa, gọi userApi.create / userApi.update
import Modal from '../../components/common/Modal';
import { ROLE_LABELS } from '../../constants/sampleData';

export default function MemberFormModal({ open, onClose, user }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Sửa thành viên' : 'Thêm thành viên'}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button type="button" className="btn btn-primary">{user ? 'Lưu thay đổi' : 'Thêm'}</button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-12"><label className="form-label">Họ và tên</label><input className="form-control" defaultValue={user?.name} placeholder="Nguyễn Văn A" /></div>
        <div className="col-md-7"><label className="form-label">Email</label><input type="email" className="form-control" defaultValue={user?.email} placeholder="ban@fpt.edu.vn" /></div>
        <div className="col-md-5">
          <label className="form-label">Vai trò</label>
          <select className="form-select" defaultValue={user?.role || 'member'}>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="col-md-6"><label className="form-label">MSSV / Mã NV</label><input className="form-control" defaultValue={user?.studentId} /></div>
        <div className="col-md-6"><label className="form-label">Điện thoại</label><input className="form-control" defaultValue={user?.phone} /></div>
        {!user && <div className="col-12"><label className="form-label">Mật khẩu ban đầu</label><input type="password" className="form-control" placeholder="Tối thiểu 6 ký tự" /></div>}
      </div>
    </Modal>
  );
}
