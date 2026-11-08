// Người phụ trách: Người 1 (Thành viên & bạn đọc)
// TODO: gọi /api/cards (danh sách, cấp thẻ, khóa / gia hạn)
import { useState } from 'react';
import { IconPlus, IconLock, IconRefresh } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import MemberCard from '../../components/common/MemberCard';
import CardFormModal from './CardFormModal';
import { CARDS, CARD_STATUS } from '../../constants/sampleData';

export default function CardListPage() {
  const [openForm, setOpenForm] = useState(false);

  return (
    <>
      <PageHeader
        title="Thẻ thư viện"
        subtitle={`${CARDS.length} thẻ đã cấp`}
        actions={<button className="btn btn-primary" type="button" onClick={() => setOpenForm(true)}><IconPlus size={17} className="me-1" /> Cấp thẻ mới</button>}
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="row g-4">
            <div className="col-lg-4">
              <MemberCard card={CARDS[0]} />
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-outline flex-fill" type="button"><IconRefresh size={16} className="me-1" /> Gia hạn</button>
                <button className="btn btn-outline-danger flex-fill" type="button"><IconLock size={16} className="me-1" /> Khóa thẻ</button>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="card">
                <div className="table-responsive">
                  <table className="table table-vcenter card-table">
                    <thead><tr><th>Mã thẻ</th><th>Chủ thẻ</th><th>Ngày cấp</th><th>Hết hạn</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      {CARDS.map((c) => (
                        <tr key={c._id}>
                          <td className="fw-bold">{c.cardCode}</td>
                          <td>{c.userName}<div className="small text-secondary">{c.studentId}</div></td>
                          <td className="text-secondary">{c.issueDate}</td>
                          <td className="text-secondary">{c.expiryDate}</td>
                          <td><StatusBadge value={c.status} map={CARD_STATUS} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CardFormModal open={openForm} onClose={() => setOpenForm(false)} />
    </>
  );
}
