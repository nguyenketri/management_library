// Người phụ trách: Người 1 (thông tin cá nhân) · Phần xác thực (ô đổi mật khẩu)
// TODO: gọi GET/PUT /api/users/me
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { CURRENT_USER, ROLE_LABELS } from '../../constants/sampleData';

export default function ProfilePage() {
  const u = CURRENT_USER;

  return (
    <>
      <PageHeader title="Hồ sơ cá nhân" />
      <div className="page-body">
        <div className="container-xl">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body text-center py-5">
                  <span className="avatar avatar-xl avatar-lime mb-3" style={{ fontSize: '2.2rem' }}>{u.name.charAt(0)}</span>
                  <h2 className="mb-1">{u.name}</h2>
                  <div className="text-secondary mb-3">{u.email}</div>
                  <StatusBadge value={u.role} map={ROLE_LABELS} />
                </div>
              </div>
            </div>
            <div className="col-lg-8 d-flex flex-column gap-4">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title mb-4">Thông tin cá nhân</h3>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label">Họ và tên</label><input className="form-control" defaultValue={u.name} /></div>
                    <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" defaultValue={u.email} disabled /></div>
                    <div className="col-md-6"><label className="form-label">Điện thoại</label><input className="form-control" defaultValue={u.phone} /></div>
                    <div className="col-md-6"><label className="form-label">MSSV / Mã NV</label><input className="form-control" defaultValue={u.studentId} /></div>
                  </div>
                  <div className="text-end mt-4"><button className="btn btn-primary" type="button">Lưu thay đổi</button></div>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title mb-4">Đổi mật khẩu</h3>
                  <div className="row g-3">
                    <div className="col-md-4"><label className="form-label">Mật khẩu hiện tại</label><input type="password" className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Mật khẩu mới</label><input type="password" className="form-control" /></div>
                    <div className="col-md-4"><label className="form-label">Nhập lại</label><input type="password" className="form-control" /></div>
                  </div>
                  <div className="text-end mt-4"><button className="btn btn-outline" type="button">Đổi mật khẩu</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
