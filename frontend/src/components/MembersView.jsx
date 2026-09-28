import React from 'react';
import { INITIAL_USERS } from '../constants/libraryData';

export default function MembersView({ borrows, onSelectUser, currentUser }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="role-badge badge-admin">Quản Trị Viên (Admin)</span>;
      case 'librarian':
        return <span className="role-badge badge-librarian">Thủ Thư (Librarian)</span>;
      default:
        return <span className="role-badge badge-member">Độc Giả (Member)</span>;
    }
  };

  return (
    <div>
      <div className="section-intro">
        <h3>👥 5 Thành Viên Đại Diện Trong Hệ Thống Thư Viện</h3>
        <p>Hệ thống hỗ trợ 3 nhóm vai trò (Actors): <strong>Admin</strong> (Toàn quyền), <strong>Librarian</strong> (Thủ thư quản lý kho & duyệt mượn trả), <strong>Member</strong> (Độc giả mượn sách).</p>
      </div>

      <div className="members-grid">
        {INITIAL_USERS.map((user) => {
          const activeBorrows = borrows.filter(
            (b) => b.userId === user._id && b.status === 'borrowed'
          );
          const isCurrent = currentUser._id === user._id;

          return (
            <div key={user._id} className={`member-card ${isCurrent ? 'current-actor' : ''}`}>
              <div className="member-card-header">
                <div className="member-avatar">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="member-name">{user.name} {isCurrent && '🌟 (Bạn)'}</h4>
                  <div className="member-id">Mã: {user.studentId}</div>
                </div>
              </div>

              <div className="member-body">
                <div className="member-row">
                  <span>Vai trò:</span>
                  {getRoleBadge(user.role)}
                </div>
                <div className="member-row">
                  <span>Email:</span>
                  <code>{user.email}</code>
                </div>
                <div className="member-row">
                  <span>Điện thoại:</span>
                  <span>{user.phone}</span>
                </div>
                <div className="member-row">
                  <span>Sách đang giữ:</span>
                  <strong style={{ color: activeBorrows.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
                    {activeBorrows.length} cuốn
                  </strong>
                </div>

                {activeBorrows.length > 0 && (
                  <div className="borrowed-mini-list">
                    {activeBorrows.map((b) => (
                      <div key={b._id} className="mini-book-item">
                        📖 {b.bookTitle} (Hạn: {b.dueDate})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className={`btn-secondary ${isCurrent ? 'active' : ''}`}
                style={{ width: '100%', marginTop: '12px' }}
                onClick={() => onSelectUser(user)}
              >
                {isCurrent ? '✓ Đang đóng vai' : 'Đổi sang người này'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
