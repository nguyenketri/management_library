// Người phụ trách: Người 1 (thông tin cá nhân). Ô đổi mật khẩu: ChangePasswordForm (phần xác thực)
// TODO: lưu thông tin bằng PUT /api/users/me
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import ChangePasswordForm from './ChangePasswordForm';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../constants/sampleData';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="Hồ sơ cá nhân" />
      <div className="page-body">
        <div className="container-xl">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body text-center py-5">
                  <span className="avatar avatar-xl avatar-lime mb-3" style={{ fontSize: '2.2rem' }}>{user.name.charAt(0)}</span>
                  <h2 className="mb-1">{user.name}</h2>
                  <div className="text-secondary mb-3">{user.email}</div>
                  <StatusBadge value={user.role} map={ROLE_LABELS} />
                </div>
              </div>
            </div>
            <div className="col-lg-8 d-flex flex-column gap-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title mb-4">Thông tin cá nhân</h3>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label">Họ và tên</label><input className="form-control" defaultValue={user.name} /></div>
                    <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" defaultValue={user.email} disabled /></div>
                    <div className="col-md-6"><label className="form-label">Điện thoại</label><input className="form-control" defaultValue={user.phone} /></div>
                    <div className="col-md-6"><label className="form-label">MSSV / Mã NV</label><input className="form-control" defaultValue={user.studentId} /></div>
                  </div>
                  <div className="text-end mt-4"><button className="btn btn-primary" type="button">Lưu thay đổi</button></div>
                </div>
              </div>
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
