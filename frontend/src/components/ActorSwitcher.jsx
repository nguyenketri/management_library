import React from 'react';
import { INITIAL_USERS } from '../constants/libraryData';

export default function ActorSwitcher({ currentUser, onSelectUser, isBackendConnected }) {
  const getRoleBadgeClass = (role) => {
    if (role === 'admin') return 'badge-admin';
    if (role === 'librarian') return 'badge-librarian';
    return 'badge-member';
  };

  return (
    <div className="actor-switcher-bar">
      <div className="actor-info">
        <span className="actor-label">🎭 Đang đóng vai:</span>
        <select
          className="actor-select"
          value={currentUser._id}
          onChange={(e) => {
            const found = INITIAL_USERS.find((u) => u._id === e.target.value);
            if (found) onSelectUser(found);
          }}
        >
          {INITIAL_USERS.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.roleLabel})
            </option>
          ))}
        </select>
        <span className={`role-badge ${getRoleBadgeClass(currentUser.role)}`}>
          {currentUser.role.toUpperCase()}
        </span>
      </div>

      <div className="backend-indicator">
        <span className={`status-dot ${isBackendConnected ? 'online' : 'mock'}`} />
        <span className="status-text">
          {isBackendConnected ? 'Backend & MongoDB Connected' : 'Chế độ Mock Database (5 Người)'}
        </span>
      </div>
    </div>
  );
}
