// Người phụ trách: Phần xác thực
import { Link, useNavigate } from 'react-router-dom';
import { IconBell, IconSearch, IconLogout, IconUserCircle, IconHome, IconChevronDown, IconLayoutDashboard } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../constants/sampleData';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="app-topbar d-flex align-items-center d-print-none">
      <div className="container-xl d-flex align-items-center gap-3">
        <label className="input-pill d-none d-md-flex mb-0" style={{ width: 360, padding: '0.45rem 1rem' }}>
          <IconSearch size={17} className="text-secondary" />
          <input type="text" placeholder="Tìm sách, tác giả, bạn đọc..." />
        </label>

        <div className="ms-auto d-flex align-items-center gap-1">
          <Link to="/" className="btn btn-ghost btn-icon" title="Trang giới thiệu"><IconHome size={19} /></Link>
          <button className="btn btn-ghost btn-icon position-relative" type="button" title="Thông báo">
            <IconBell size={19} />
            <span className="badge bg-red badge-notification badge-blink" />
          </button>

          {/* Menu tài khoản */}
          <div className="dropdown ms-2">
            <a href="#" className="user-toggle" data-bs-toggle="dropdown" data-bs-offset="0,10">
              <span className="avatar avatar-sm avatar-lime">{user.name.charAt(0)}</span>
              <div className="d-none d-xl-block lh-sm">
                <div className="fw-bold small">{user.name}</div>
                <div className="small text-secondary">{ROLE_LABELS[user.role]?.label}</div>
              </div>
              <IconChevronDown size={16} className="user-toggle-arrow" />
            </a>

            <div className="dropdown-menu dropdown-menu-end user-menu">
              <div className="user-menu-head">
                <span className="avatar avatar-lime">{user.name.charAt(0)}</span>
                <div className="lh-sm text-truncate">
                  <div className="fw-bold text-truncate">{user.name}</div>
                  <div className="small text-secondary text-truncate">{user.email}</div>
                </div>
              </div>

              <Link to="/dashboard" className="dropdown-item"><IconLayoutDashboard size={18} /> Trang chủ</Link>
              <Link to="/profile" className="dropdown-item"><IconUserCircle size={18} /> Hồ sơ cá nhân</Link>
              <div className="dropdown-divider" />
              <button type="button" className="dropdown-item item-danger" onClick={handleLogout}>
                <IconLogout size={18} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
