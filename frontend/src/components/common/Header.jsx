import React from 'react';

export default function Header({ isBackendConnected, onAddClick }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
        </div>
        <div>
          <h1 className="brand-title">Quản Lý Thư Viện</h1>
          <p className="brand-subtitle">NodeJS (MVC) &bull; ReactJS &bull; MongoDB</p>
        </div>
      </div>

      <div className="header-actions">
        <div
          className="status-badge"
          title={isBackendConnected ? 'Backend & MongoDB đã kết nối' : 'Đang ở chế độ Mock Demo (Chưa bật Backend)'}
        >
          <span className={`status-dot ${isBackendConnected ? 'online' : 'offline'}`} />
          <span>{isBackendConnected ? 'BE Connected' : 'Demo Mode'}</span>
        </div>

        <button className="btn-primary" onClick={onAddClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Thêm Sách Mới
        </button>
      </div>
    </header>
  );
}
