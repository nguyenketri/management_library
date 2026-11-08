// Người phụ trách: Người 1 (Thành viên & thẻ thư viện)
import { useEffect, useState } from 'react';
import { IconUserPlus, IconSearch, IconUserCog, IconLock, IconLockOpen } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import MemberFormModal from './MemberFormModal';
import RoleFormModal from './RoleFormModal';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, USER_STATUS } from '../../constants/sampleData';

export default function MemberListPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0); // tăng lên 1 để tải lại danh sách
  const [showCreate, setShowCreate] = useState(false); // form thêm thành viên
  const [roleUser, setRoleUser] = useState(null);       // người đang đổi vai trò

  // Tải danh sách mỗi khi đổi tab vai trò / gõ tìm kiếm (chờ 300ms sau khi gõ xong)
  useEffect(() => {
    const timer = setTimeout(() => {
      userApi.getAll({ role, keyword })
        .then((data) => {
          setUsers(data);
          setError('');
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [role, keyword, refresh]);

  const handleToggleLock = async (u) => {
    const newStatus = u.status === 'locked' ? 'active' : 'locked';
    const action = newStatus === 'locked' ? 'Khóa' : 'Mở khóa';
    if (!window.confirm(`${action} tài khoản của ${u.name}?`)) return;

    try {
      await userApi.updateStatus(u._id, newStatus);
      setUsers(users.map((item) => (item._id === u._id ? { ...item, status: newStatus } : item)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaved = () => {
    setShowCreate(false);
    setRoleUser(null);
    setRefresh(refresh + 1);
  };

  return (
    <>
      <PageHeader
        title="Thành viên"
        subtitle={loading ? 'Đang tải…' : `${users.length} tài khoản`}
        actions={
          <button className="btn btn-primary" type="button" onClick={() => setShowCreate(true)}>
            <IconUserPlus size={17} className="me-1" /> Thêm thành viên
          </button>
        }
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
            <div className="pill-tabs me-auto">
              <button type="button" className={`pill-tab ${role === 'all' ? 'active' : ''}`} onClick={() => setRole('all')}>Tất cả</button>
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <button key={k} type="button" className={`pill-tab ${role === k ? 'active' : ''}`} onClick={() => setRole(k)}>{v.label}</button>
              ))}
            </div>
            <label className="input-pill mb-0" style={{ width: 260, padding: '0.45rem 1rem' }}>
              <IconSearch size={16} className="text-secondary" />
              <input placeholder="Tên, email, MSSV…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </label>
          </div>

          {error && <div className="form-error mb-3">{error}</div>}

          <div className="card">
            <div className="table-responsive">
              <table className="table table-vcenter card-table">
                <thead>
                  <tr><th>Thành viên</th><th>Mã số</th><th>Điện thoại</th><th>Vai trò</th><th>Trạng thái</th><th className="w-1" /></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <span className="avatar">{u.name.charAt(0)}</span>
                          <div className="lh-sm">
                            <div className="fw-bold">{u.name}</div>
                            <div className="small text-secondary">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-secondary">{u.studentId || '—'}</td>
                      <td className="text-secondary">{u.phone || '—'}</td>
                      <td><StatusBadge value={u.role} map={ROLE_LABELS} /></td>
                      <td><StatusBadge value={u.status || 'active'} map={USER_STATUS} /></td>
                      <td>
                        {/* Không tự đổi vai trò / tự khóa chính mình */}
                        {u._id !== currentUser._id && (
                          <div className="d-flex">
                            <button className="btn btn-ghost btn-icon" type="button" title="Đổi vai trò" onClick={() => setRoleUser(u)}>
                              <IconUserCog size={17} />
                            </button>
                            <button className="btn btn-ghost btn-icon" type="button" title={u.status === 'locked' ? 'Mở khóa' : 'Khóa'} onClick={() => handleToggleLock(u)}>
                              {u.status === 'locked' ? <IconLockOpen size={17} /> : <IconLock size={17} />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && users.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-secondary py-5">Không tìm thấy thành viên nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showCreate && <MemberFormModal onClose={() => setShowCreate(false)} onSaved={handleSaved} />}
      {roleUser && <RoleFormModal user={roleUser} onClose={() => setRoleUser(null)} onSaved={handleSaved} />}
    </>
  );
}
