// Người phụ trách: Người 1 (Thành viên & thẻ thư viện)
import { useEffect, useState } from 'react';
import { IconPlus, IconLock, IconLockOpen, IconRefresh, IconSearch } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import MemberCard from '../../components/common/MemberCard';
import CardFormModal from './CardFormModal';
import cardApi from '../../api/cardApi';
import { CARD_STATUS } from '../../constants/sampleData';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Còn hiệu lực' },
  { key: 'expired', label: 'Hết hạn' },
  { key: 'locked', label: 'Đã khóa' },
];

const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

export default function CardListPage() {
  const [cards, setCards] = useState([]);
  const [status, setStatus] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);

  // Tải danh sách khi đổi tab / gõ tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      cardApi.getAll({ status, keyword })
        .then((data) => {
          setCards(data);
          setError('');
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [status, keyword]);

  // Thẻ đang xem bên trái (mặc định là thẻ đầu tiên)
  const selected = cards.find((c) => c._id === selectedId) || cards[0];

  // Thay thẻ cũ trong danh sách bằng thẻ mới nhận từ API
  const replaceCard = (card) => setCards(cards.map((c) => (c._id === card._id ? card : c)));

  const handleRenew = async () => {
    try {
      replaceCard(await cardApi.renew(selected._id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleLock = async () => {
    const newStatus = selected.status === 'locked' ? 'active' : 'locked';
    if (!window.confirm(`${newStatus === 'locked' ? 'Khóa' : 'Mở khóa'} thẻ ${selected.cardCode}?`)) return;
    try {
      replaceCard(await cardApi.updateStatus(selected._id, newStatus));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreated = (card) => {
    setCards([card, ...cards]);
    setSelectedId(card._id);
  };

  return (
    <>
      <PageHeader
        title="Thẻ thư viện"
        subtitle={loading ? 'Đang tải…' : `${cards.length} thẻ`}
        actions={
          <button className="btn btn-primary" type="button" onClick={() => setOpenForm(true)}>
            <IconPlus size={17} className="me-1" /> Cấp thẻ mới
          </button>
        }
      />
      <div className="page-body">
        <div className="container-xl">
          <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
            <div className="pill-tabs me-auto">
              {TABS.map((t) => (
                <button key={t.key} type="button" className={`pill-tab ${status === t.key ? 'active' : ''}`} onClick={() => setStatus(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
            <label className="input-pill mb-0" style={{ width: 260, padding: '0.45rem 1rem' }}>
              <IconSearch size={16} className="text-secondary" />
              <input placeholder="Mã thẻ, tên, MSSV…" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </label>
          </div>

          {error && <div className="form-error mb-3">{error}</div>}

          <div className="row g-4">
            {/* Thẻ đang chọn + thao tác */}
            <div className="col-lg-4">
              {selected ? (
                <>
                  <MemberCard card={selected} />
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <StatusBadge value={selected.currentStatus} map={CARD_STATUS} />
                    <span className="small text-secondary">Cấp ngày {formatDate(selected.issueDate)}</span>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-outline flex-fill" type="button" onClick={handleRenew} disabled={selected.status === 'locked'}>
                      <IconRefresh size={16} className="me-1" /> Gia hạn 1 năm
                    </button>
                    {selected.status === 'locked' ? (
                      <button className="btn btn-outline flex-fill" type="button" onClick={handleToggleLock}>
                        <IconLockOpen size={16} className="me-1" /> Mở khóa
                      </button>
                    ) : (
                      <button className="btn btn-outline-danger flex-fill" type="button" onClick={handleToggleLock}>
                        <IconLock size={16} className="me-1" /> Khóa thẻ
                      </button>
                    )}
                  </div>
                </>
              ) : (
                !loading && <div className="stat text-secondary">Chưa có thẻ nào.</div>
              )}
            </div>

            {/* Danh sách thẻ */}
            <div className="col-lg-8">
              <div className="card">
                <div className="table-responsive">
                  <table className="table table-vcenter card-table">
                    <thead><tr><th>Mã thẻ</th><th>Chủ thẻ</th><th>Ngày cấp</th><th>Hết hạn</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      {cards.map((c) => (
                        <tr key={c._id} className={`row-click ${selected?._id === c._id ? 'is-selected' : ''}`} onClick={() => setSelectedId(c._id)}>
                          <td className="fw-bold">{c.cardCode}</td>
                          <td>
                            {c.userId?.name || '(đã xóa)'}
                            <div className="small text-secondary">{c.userId?.studentId}</div>
                          </td>
                          <td className="text-secondary">{formatDate(c.issueDate)}</td>
                          <td className="text-secondary">{formatDate(c.expiryDate)}</td>
                          <td><StatusBadge value={c.currentStatus} map={CARD_STATUS} /></td>
                        </tr>
                      ))}
                      {!loading && cards.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-secondary py-5">Không có thẻ nào</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CardFormModal open={openForm} onClose={() => setOpenForm(false)} onSaved={handleCreated} />
    </>
  );
}
