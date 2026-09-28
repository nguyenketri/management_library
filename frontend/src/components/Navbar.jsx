import React from 'react';

export default function Navbar({
  currentUser,
  onLogout,
  onOpenLogin,
  onOpenRegister,
  activeTab,
  onTabChange,
  isBackendConnected,
}) {
  const getBadgeColor = (role) => {
    if (role === 'admin') return 'bg-danger';
    if (role === 'librarian') return 'bg-warning text-dark';
    return 'bg-info text-dark';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary mb-4 shadow">
      <div className="container">
        {/* Brand */}
        <a
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-light"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('books');
          }}
        >
          <span className="fs-3">📚</span>
          <div>
            <div className="lh-1 fs-5">FPT Library</div>
            <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
              Management System (MERN)
            </small>
          </div>
        </a>

        {/* Toggle mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
            <li className="nav-item">
              <button
                className={`btn btn-sm ${activeTab === 'books' ? 'btn-primary' : 'btn-outline-light text-light border-0'}`}
                onClick={() => onTabChange('books')}
              >
                📖 Kho Sách
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`btn btn-sm ${activeTab === 'borrows' ? 'btn-primary' : 'btn-outline-light text-light border-0'}`}
                onClick={() => onTabChange('borrows')}
              >
                📝 Phiếu Mượn / Trả
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`btn btn-sm ${activeTab === 'members' ? 'btn-primary' : 'btn-outline-light text-light border-0'}`}
                onClick={() => onTabChange('members')}
              >
                👥 5 Thành Viên
              </button>
            </li>
          </ul>

          {/* Right section: Auth status */}
          <div className="d-flex align-items-center gap-3">
            {/* Status indicator */}
            <div
              className="badge bg-secondary bg-opacity-50 text-light border border-secondary px-2 py-1 small d-none d-md-flex align-items-center gap-1"
              title={isBackendConnected ? 'Backend & MongoDB đã kết nối' : 'Đang ở chế độ Mock DB In-Memory'}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: isBackendConnected ? '#10b981' : '#06b6d4',
                  display: 'inline-block',
                }}
              />
              <span>{isBackendConnected ? 'BE Connected' : 'Mock DB'}</span>
            </div>

            {currentUser ? (
              <div className="d-flex align-items-center gap-2">
                <div className="text-end d-none d-sm-block">
                  <div className="fw-semibold text-light small">{currentUser.name}</div>
                  <span className={`badge ${getBadgeColor(currentUser.role)}`} style={{ fontSize: '0.7rem' }}>
                    {currentUser.role?.toUpperCase()}
                  </span>
                </div>

                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{ width: 38, height: 38 }}
                >
                  {currentUser.name?.charAt(0)}
                </div>

                <button
                  className="btn btn-outline-danger btn-sm ms-2"
                  onClick={onLogout}
                  title="Đăng xuất khỏi tài khoản này"
                >
                  Đăng Xuất
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-outline-light btn-sm" onClick={onOpenLogin}>
                  🔑 Đăng Nhập
                </button>
                <button className="btn btn-primary btn-sm" onClick={onOpenRegister}>
                  📝 Đăng Ký
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
