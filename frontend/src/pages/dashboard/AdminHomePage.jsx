// Người phụ trách: Người 1 (Thành viên & thẻ thư viện)
// Trang chủ của ADMIN: tổng quan tài khoản trong hệ thống
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IconUserPlus, IconLockOpen, IconArrowRight } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import userApi from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/sampleData';

const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

export default function AdminHomePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    userApi.getAll()
      .then(setUsers)
      .catch((err) => setError(err.message));
  }, []);

  const countRole = (role) => users.filter((u) => u.role === role).length;
  const locked = users.filter((u) => u.status === 'locked');
  const newest = [...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const handleUnlock = async (u) => {
    if (!window.confirm(`Mở khóa tài khoản của ${u.name}?`)) return;
    try {
      await userApi.updateStatus(u._id, 'active');
      setUsers(users.map((item) => (item._id === u._id ? { ...item, status: 'active' } : item)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Trang quản trị"
        subtitle={`Xin chào ${user.name.split(' ').pop()}, đây là tình hình tài khoản trong hệ thống.`}
        actions={
          <Link to="/members" className="btn btn-primary">
            <IconUserPlus size={17} className="me-1" /> Quản lý thành viên
          </Link>
        }
      />
      <div className="page-body">
        <div className="container-xl">
          {error && <div className="form-error mb-3">{error}</div>}

          <div className="row g-3">
            <div className="col-6 col-lg-3"><StatCard label="Tổng tài khoản" value={users.length} highlight /></div>
            <div className="col-6 col-lg-3"><StatCard label="Độc giả" value={countRole('member')} /></div>
            <div className="col-6 col-lg-3">
              <StatCard label="Nhân viên" value={countRole('librarian') + countRole('manager')} hint={`${countRole('librarian')} thủ thư · ${countRole('manager')} quản lý`} />
            </div>
            <div className="col-6 col-lg-3"><StatCard label="Đang bị khóa" value={locked.length} hint={locked.length ? 'cần xem xét' : 'không có'} /></div>
          </div>

          <div className="row g-4 mt-1">
            {/* Tài khoản mới */}
            <div className="col-lg-7">
              <div className="card h-100">
                <div className="card-header">
                  <h3 className="card-title">Tài khoản mới nhất</h3>
                  <Link to="/members" className="ms-auto small fw-bold">Xem tất cả <IconArrowRight size={14} /></Link>
                </div>
                <div className="card-body py-1">
                  {newest.map((u) => (
                    <div key={u._id} className="task">
                      <span className="avatar avatar-sm">{u.name.charAt(0)}</span>
                      <div className="flex-fill lh-sm text-truncate">
                        <div className="fw-bold text-truncate">{u.name}</div>
                        <div className="small text-secondary text-truncate">{u.email}</div>
                      </div>
                      <StatusBadge value={u.role} map={ROLE_LABELS} />
                      <span className="small text-secondary" style={{ width: 80, textAlign: 'right' }}>{formatDate(u.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tài khoản bị khóa */}
            <div className="col-lg-5">
              <div className="card h-100">
                <div className="card-header"><h3 className="card-title">Tài khoản bị khóa</h3></div>
                <div className="card-body py-1">
                  {locked.length === 0 && <div className="text-secondary py-4 text-center">Không có tài khoản nào bị khóa.</div>}
                  {locked.map((u) => (
                    <div key={u._id} className="task">
                      <span className="avatar avatar-sm">{u.name.charAt(0)}</span>
                      <div className="flex-fill lh-sm text-truncate">
                        <div className="fw-bold text-truncate">{u.name}</div>
                        <div className="small text-secondary">{ROLE_LABELS[u.role]?.label}</div>
                      </div>
                      <button className="btn btn-sm btn-outline" type="button" onClick={() => handleUnlock(u)}>
                        <IconLockOpen size={15} className="me-1" /> Mở khóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
