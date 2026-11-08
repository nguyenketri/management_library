// Người phụ trách: Phần xác thực
import { Link, useNavigate } from 'react-router-dom';
import { IconBell, IconSearch, IconLogout, IconUserCircle, IconHome } from '@tabler/icons-react';
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

          <div className="dropdown ms-2">
            <a href="#" className="d-flex align-items-center gap-2 text-reset text-decoration-none" data-bs-toggle="dropdown">
              <span className="avatar avatar-sm avatar-lime">{user.name.charAt(0)}</span>
              <div className="d-none d-xl-block lh-sm">
                <div className="fw-bold small">{user.name}</div>
                <div className="small text-secondary">{ROLE_LABELS[user.role]?.label}</div>
              </div>
            </a>
            <div className="dropdown-menu dropdown-menu-end p-2">
              <Link to="/profile" className="dropdown-item"><IconUserCircle size={17} className="me-2" /> Hồ sơ cá nhân</Link>
              <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>
                <IconLogout size={17} className="me-2" /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
