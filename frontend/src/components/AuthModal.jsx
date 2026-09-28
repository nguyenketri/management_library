import React, { useState } from 'react';
import authApi from '../api/authApi';
import { INITIAL_USERS } from '../constants/libraryData';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Đăng nhập
  const [loginForm, setLoginForm] = useState({
    email: 'admin@library.edu.vn',
    password: 'password123',
  });

  // Form Đăng ký
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    phone: '',
    role: 'member',
  });

  if (!isOpen) return null;

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Thử gọi API Backend
      const res = await authApi.login(loginForm);
      onAuthSuccess(res.data);
      onClose();
    } catch (err) {
      // 2. Fallback kiểm tra trong Mock Data nếu BE chưa bật
      const found = INITIAL_USERS.find(
        (u) =>
          u.email.toLowerCase() === loginForm.email.toLowerCase().trim() &&
          loginForm.password === 'password123'
      );

      if (found) {
        onAuthSuccess(found);
        onClose();
      } else {
        setErrorMsg(err.message || 'Email hoặc mật khẩu không chính xác!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Nút đăng nhập nhanh cho giảng viên / sinh viên test
  const handleQuickLogin = (email) => {
    setLoginForm({ email, password: 'password123' });
    setErrorMsg('');
  };

  // Xử lý đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setErrorMsg('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await authApi.register(registerForm);
      alert('Đăng ký thành công! Bạn có thể sử dụng tài khoản này ngay.');
      onAuthSuccess(res.data);
      onClose();
    } catch (err) {
      // Fallback mock
      const newMockUser = {
        _id: `usr_${Date.now()}`,
        ...registerForm,
        createdAt: new Date(),
      };
      INITIAL_USERS.push(newMockUser);
      alert('Đăng ký tài khoản thành viên thành công (Mock DB)!');
      onAuthSuccess(newMockUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 bg-dark text-light">
          {/* Header Modal */}
          <div className="modal-header border-secondary">
            <h5 className="modal-title fw-bold">
              {mode === 'login' ? '🔐 Đăng Nhập Hệ Thống' : '📝 Đăng Ký Tài Khoản Mới'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Toggle Chuyển Đổi Tab Đăng nhập / Đăng ký */}
          <div className="p-3 pb-0">
            <ul className="nav nav-pills nav-fill bg-secondary bg-opacity-25 rounded p-1">
              <li className="nav-item">
                <button
                  className={`nav-link ${mode === 'login' ? 'active bg-primary' : 'text-light'}`}
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                >
                  Đăng Nhập
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${mode === 'register' ? 'active bg-primary' : 'text-light'}`}
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                >
                  Đăng Ký Thành Viên
                </button>
              </li>
            </ul>
          </div>

          <div className="modal-body p-4">
            {errorMsg && (
              <div className="alert alert-danger py-2 small" role="alert">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* FORM ĐĂNG NHẬP */}
            {mode === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Địa chỉ Email:</label>
                  <input
                    type="email"
                    className="form-control bg-secondary bg-opacity-10 text-light border-secondary"
                    required
                    placeholder="ví dụ: admin@library.edu.vn"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Mật khẩu:</label>
                  <input
                    type="password"
                    className="form-control bg-secondary bg-opacity-10 text-light border-secondary"
                    required
                    placeholder="Nhập mật khẩu..."
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                  <div className="form-text text-secondary small">
                    Mật khẩu mặc định cho các tài khoản mẫu: <code>password123</code>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mb-3" disabled={loading}>
                  {loading ? 'Đang xác thực...' : 'Đăng Nhập Ngay'}
                </button>

                {/* Phím tắt đăng nhập nhanh để demo */}
                <div className="border-top border-secondary pt-3 mt-2">
                  <div className="small text-muted mb-2 text-center">⚡ Chọn nhanh tài khoản mẫu để test:</div>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleQuickLogin('admin@library.edu.vn')}
                    >
                      👑 Admin
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => handleQuickLogin('librarian@library.edu.vn')}
                    >
                      📚 Thủ thư
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-info btn-sm"
                      onClick={() => handleQuickLogin('namlh@fpt.edu.vn')}
                    >
                      🎓 Sinh viên 1
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-info btn-sm"
                      onClick={() => handleQuickLogin('anhpm@fpt.edu.vn')}
                    >
                      🎓 Sinh viên 2
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* FORM ĐĂNG KÝ */}
            {mode === 'register' && (
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Họ và tên *</label>
                  <input
                    type="text"
                    className="form-control bg-secondary bg-opacity-10 text-light border-secondary"
                    required
                    placeholder="Nguyễn Văn A..."
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Email sinh viên / liên hệ *</label>
                  <input
                    type="email"
                    className="form-control bg-secondary bg-opacity-10 text-light border-secondary"
                    required
                    placeholder="tenban@fpt.edu.vn"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small text-muted">Mật khẩu *</label>
                    <input
                      type="password"
                      className="form-control bg-secondary bg-opacity-10 text-light border-secondary"
                      required
                      placeholder="Mật khẩu..."
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Mã số sinh viên (MSSV)</label>
                    <input
                      type="text"
                      className="form-control bg-secondary bg-opacity-10 text-light border-secondary"
                      placeholder="SE17..."
                      value={registerForm.studentId}
                      onChange={(e) => setRegisterForm({ ...registerForm, studentId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small text-muted">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control bg-secondary bg-opacity-10 text-light border-secondary"
                      placeholder="09..."
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Vai trò đăng ký</label>
                    <select
                      className="form-select bg-secondary bg-opacity-10 text-light border-secondary"
                      value={registerForm.role}
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                    >
                      <option value="member" className="bg-dark">Độc giả (Sinh viên)</option>
                      <option value="librarian" className="bg-dark">Thủ thư</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-success w-100 py-2 fw-semibold" disabled={loading}>
                  {loading ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
