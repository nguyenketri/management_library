// Người phụ trách: Phần xác thực
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Tài khoản mẫu (mật khẩu chung password123) – bấm để điền nhanh khi demo
const DEMO_ACCOUNTS = [
  { label: 'Độc giả', email: 'namlh@fpt.edu.vn' },
  { label: 'Thủ thư', email: 'librarian@library.edu.vn' },
  { label: 'Quản lý', email: 'manager@library.edu.vn' },
  { label: 'Admin', email: 'admin@library.edu.vn' },
];

export default function LoginPage() {
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      await login(form.email, form.password); // thành công -> AuthLayout tự chuyển trang
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="mb-2">Chào mừng trở lại.</h1>
      <p className="text-secondary mb-5">Đăng nhập để mượn sách và theo dõi hạn trả.</p>

      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="form-error mb-3">{error}</div>}

        <div className="mb-3">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="form-control" placeholder="ban@fpt.edu.vn"
            value={form.email} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label className="form-label" htmlFor="password">Mật khẩu</label>
          <input id="password" name="password" type="password" className="form-control" placeholder="••••••••"
            value={form.password} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
          {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-4">
        <div className="small text-secondary mb-2">Tài khoản mẫu (mật khẩu: password123)</div>
        <div className="d-flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button key={acc.email} type="button" className="btn btn-sm btn-outline"
              onClick={() => setForm({ email: acc.email, password: 'password123' })}>
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-secondary text-center mt-4 mb-0">
        Chưa có tài khoản? <Link to="/register" className="fw-bold">Đăng ký</Link>
      </p>
    </>
  );
}
