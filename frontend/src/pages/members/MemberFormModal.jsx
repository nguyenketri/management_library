// Người phụ trách: Người 1 (Thành viên & thẻ thư viện)
// Admin tạo tài khoản mới (sau đó thông tin cá nhân do chính người dùng tự sửa trong Hồ sơ)
import { useState } from 'react';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import userApi from '../../api/userApi';
import { ROLE_LABELS } from '../../constants/sampleData';

const EMPTY_FORM = { name: '', email: '', role: 'member', studentId: '', phone: '', password: '' };

export default function MemberFormModal({ onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Vui lòng nhập họ tên và email');
      return;
    }

    try {
      setLoading(true);
      await userApi.create(form);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Thêm thành viên"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button type="submit" form="member-form" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang lưu…' : 'Thêm'}
          </button>
        </>
      }
    >
      <form id="member-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="form-error mb-3">{error}</div>}
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Họ và tên</label>
            <input name="name" className="form-control" placeholder="Nguyễn Văn A" value={form.name} onChange={handleChange} />
          </div>
          <div className="col-md-7">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-control" placeholder="ban@fpt.edu.vn" value={form.email} onChange={handleChange} />
          </div>
          <div className="col-md-5">
            <label className="form-label">Vai trò</label>
            <Select
              value={form.role}
              onChange={(role) => setForm({ ...form, role })}
              options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">MSSV / Mã NV</label>
            <input name="studentId" className="form-control" value={form.studentId} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Điện thoại</label>
            <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label">Mật khẩu ban đầu</label>
            <input name="password" type="password" className="form-control" placeholder="Để trống = password123"
              value={form.password} onChange={handleChange} />
          </div>
        </div>
        <div className="form-hint mt-3">Sau khi tạo, thông tin cá nhân do chính người dùng tự cập nhật trong Hồ sơ.</div>
      </form>
    </Modal>
  );
}
