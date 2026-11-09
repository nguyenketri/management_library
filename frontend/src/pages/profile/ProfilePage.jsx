// Người phụ trách: Người 1 (thông tin cá nhân). Ô đổi mật khẩu: ChangePasswordForm (phần xác thực)
import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import ChangePasswordForm from './ChangePasswordForm';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/sampleData';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', studentId: user.studentId || '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Lấy hồ sơ mới nhất từ server
  useEffect(() => {
    userApi.getMe()
      .then((me) => setForm({ name: me.name, phone: me.phone || '', studentId: me.studentId || '' }))
      .catch((err) => setError(err.message));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Họ tên không được để trống');
      return;
    }

    try {
      setLoading(true);
      const me = await userApi.updateMe(form);
      updateUser({ name: me.name, phone: me.phone, studentId: me.studentId });
      setSuccess('Đã lưu thông tin cá nhân');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Hồ sơ cá nhân" />
      <div className="page-body">
        <div className="container-xl">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body text-center py-5">
                  <span className="avatar avatar-xl avatar-lime mb-3" style={{ fontSize: '2.2rem' }}>{user.name.charAt(0)}</span>
                  <h2 className="mb-1">{user.name}</h2>
                  <div className="text-secondary mb-3">{user.email}</div>
                  <StatusBadge value={user.role} map={ROLE_LABELS} />
                </div>
              </div>
            </div>

            <div className="col-lg-8 d-flex flex-column gap-4">
              <form className="card" onSubmit={handleSubmit} noValidate>
                <div className="card-body">
                  <h3 className="card-title mb-4">Thông tin cá nhân</h3>
                  {error && <div className="form-error mb-3">{error}</div>}
                  {success && <div className="form-success mb-3">{success}</div>}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Họ và tên</label>
                      <input name="name" className="form-control" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input className="form-control" value={user.email} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Điện thoại</label>
                      <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">MSSV / Mã NV</label>
                      <input name="studentId" className="form-control" value={form.studentId} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="text-end mt-4">
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                      {loading ? 'Đang lưu…' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>
              </form>

              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
