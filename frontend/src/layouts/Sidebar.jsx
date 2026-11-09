import { NavLink, Link } from 'react-router-dom';
import { MENU } from '../constants/menu';
import { useAuth } from '../context/AuthContext';

// Mỗi vai trò thấy menu riêng (lọc theo roles trong constants/menu.js)
export default function Sidebar() {
  const { role } = useAuth().user;
  const items = MENU.filter((m) => m.roles.includes(role));

  return (
    <aside className="navbar navbar-vertical navbar-expand-lg app-sidebar">
      <div className="container-fluid p-0 d-flex flex-column align-items-stretch h-100">
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/dashboard" className="app-brand">fu<b>.</b>library</Link>
          <button className="navbar-toggler me-3" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar-menu">
            <span className="navbar-toggler-icon" />
          </button>
        </div>

        <div className="collapse navbar-collapse flex-column align-items-stretch" id="sidebar-menu">
          <div className="app-nav-label">Menu</div>
          <nav className="d-flex flex-column">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink key={to + label} to={to} className="app-nav-link">
                <Icon size={19} stroke={1.8} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="app-sidebar-card">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="live-dot" />
              <span className="small fw-bold text-lime">Đang mở cửa</span>
            </div>
            <div className="small text-secondary">Hôm nay 7:30 – 21:00</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
