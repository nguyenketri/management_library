// Người phụ trách: Phần xác thực
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EMPTY_FORM = { name: '', studentId: '', phone: '', email: '', password: '' };

export default function RegisterPage() {
  const { register } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Vui lòng nhập họ tên, email và mật khẩu');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      await register(form); // thành công -> AuthLayout tự chuyển trang
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="mb-2">Tạo tài khoản độc giả.</h1>
      <p className="text-secondary mb-5">Miễn phí cho sinh viên. Mất chưa tới một phút.</p>

      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="form-error mb-3">{error}</div>}

        <div className="mb-3">
          <label className="form-label" htmlFor="name">Họ và tên</label>
          <input id="name" name="name" className="form-control" placeholder="Nguyễn Văn A"
            value={form.name} onChange={handleChange} />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label" htmlFor="studentId">MSSV</label>
            <input id="studentId" name="studentId" className="form-control" placeholder="SE170001"
              value={form.studentId} onChange={handleChange} />
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="phone">Điện thoại</label>
            <input id="phone" name="phone" className="form-control" placeholder="09xx xxx xxx"
              value={form.phone} onChange={handleChange} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="form-control" placeholder="ban@fpt.edu.vn"
            value={form.email} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label className="form-label" htmlFor="password">Mật khẩu</label>
          <input id="password" name="password" type="password" className="form-control" placeholder="Tối thiểu 6 ký tự"
            value={form.password} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
          {loading ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
        </button>
      </form>

      <p className="text-secondary text-center mt-4 mb-0">
        Đã có tài khoản? <Link to="/login" className="fw-bold">Đăng nhập</Link>
      </p>
    </>
  );
}
