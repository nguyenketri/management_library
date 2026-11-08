// Người phụ trách: Phần xác thực
import { useState } from 'react';
import authApi from '../../api/authApi';

const EMPTY_FORM = { oldPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePasswordForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    try {
      setLoading(true);
      const data = await authApi.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      setSuccess(data.message);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="card-body">
        <h3 className="card-title mb-4">Đổi mật khẩu</h3>
        {error && <div className="form-error mb-3">{error}</div>}
        {success && <div className="form-success mb-3">{success}</div>}

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Mật khẩu hiện tại</label>
            <input type="password" name="oldPassword" className="form-control" value={form.oldPassword} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Mật khẩu mới</label>
            <input type="password" name="newPassword" className="form-control" value={form.newPassword} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Nhập lại</label>
            <input type="password" name="confirmPassword" className="form-control" value={form.confirmPassword} onChange={handleChange} />
          </div>
        </div>
        <div className="text-end mt-4">
          <button className="btn btn-outline" type="submit" disabled={loading}>
            {loading ? 'Đang lưu…' : 'Đổi mật khẩu'}
          </button>
        </div>
      </div>
    </form>
  );
}
