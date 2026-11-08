// Người phụ trách: Người 1 (Thành viên & bạn đọc)
// TODO: gọi userApi.getAll(role), thêm / sửa / khóa tài khoản
import { useState } from 'react';
import { IconUserPlus, IconSearch, IconDots } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { USERS, ROLE_LABELS } from '../../constants/sampleData';

export default function MemberListPage() {
  const [role, setRole] = useState('all'); // chỉ để demo giao diện tab

  return (
    <>
      <PageHeader
        title="Thành viên"
        subtitle={`${USERS.length} tài khoản`}
        actions={<button className="btn btn-primary" type="button"><IconUserPlus size={17} className="me-1" /> Thêm thành viên</button>}
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
              <input placeholder="Tên, email, MSSV…" />
            </label>
          </div>

          <div className="card">
            <div className="table-responsive">
              <table className="table table-vcenter card-table">
                <thead><tr><th>Thành viên</th><th>Mã số</th><th>Điện thoại</th><th>Vai trò</th><th className="text-center">Đang mượn</th><th className="w-1" /></tr></thead>
                <tbody>
                  {USERS.map((u) => (
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
                      <td className="text-secondary">{u.studentId}</td>
                      <td className="text-secondary">{u.phone}</td>
                      <td><StatusBadge value={u.role} map={ROLE_LABELS} /></td>
                      <td className="text-center fw-bold">{u.activeBorrows}</td>
                      <td><button className="btn btn-ghost btn-icon" type="button"><IconDots size={17} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
