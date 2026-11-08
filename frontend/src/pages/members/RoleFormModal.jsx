// Người phụ trách: Người 1 (Thành viên & thẻ thư viện)
// Admin đổi vai trò. Thông tin cá nhân chỉ hiển thị – admin không được sửa (bảo vệ dữ liệu người dùng)
import { useState } from 'react';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import userApi from '../../api/userApi';
import { ROLE_LABELS } from '../../constants/sampleData';

export default function RoleFormModal({ user, onClose, onSaved }) {
  const [role, setRole] = useState(user.role);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await userApi.updateRole(user._id, role);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const info = [
    ['Email', user.email],
    ['MSSV / Mã NV', user.studentId || '—'],
    ['Điện thoại', user.phone || '—'],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title="Đổi vai trò"
      width={480}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button type="submit" form="role-form" className="btn btn-primary" disabled={loading || role === user.role}>
            {loading ? 'Đang lưu…' : 'Lưu vai trò'}
          </button>
        </>
      }
    >
      <form id="role-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="form-error mb-3">{error}</div>}

        {/* Thông tin cá nhân: chỉ xem */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <span className="avatar">{user.name.charAt(0)}</span>
          <div className="fw-bold fs-3">{user.name}</div>
        </div>
        <div className="row g-2 mb-4">
          {info.map(([label, value]) => (
            <div key={label} className="col-12 d-flex justify-content-between small">
              <span className="text-secondary">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>

        <label className="form-label">Vai trò</label>
        <Select
          value={role}
          onChange={setRole}
          options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v.label }))}
        />
        <div className="form-hint mt-3">Admin chỉ đổi vai trò và khóa tài khoản. Thông tin cá nhân do người dùng tự cập nhật.</div>
      </form>
    </Modal>
  );
}
