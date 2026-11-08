// Người phụ trách: Người 3 (Mượn trả & báo cáo)
// Trang chủ của THỦ THƯ: việc cần làm hôm nay. TODO: gọi borrowApi + bookApi
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconBookUpload, IconBookDownload, IconPlus, IconId, IconBellRinging } from '@tabler/icons-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import BookCover from '../../components/common/BookCover';
import BorrowFormModal from '../borrows/BorrowFormModal';
import BookFormModal from '../books/BookFormModal';
import CardFormModal from '../cards/CardFormModal';
import { BOOKS, BORROWS, BORROW_STATUS, TODAY } from '../../constants/sampleData';

const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

export default function LibrarianHomePage() {
  const [modal, setModal] = useState(null); // 'borrow' | 'book' | 'card' | null
  const close = () => setModal(null);

  // Phiếu cần chú ý: quá hạn hoặc còn ≤ 3 ngày
  const attention = BORROWS.filter((r) => r.status !== 'returned' && daysBetween(TODAY, r.dueDate) <= 3);
  const lowStock = BOOKS.filter((b) => b.availableCopies <= 1);

  const quick = [
    { key: 'borrow', icon: IconBookUpload, title: 'Lập phiếu mượn', text: 'Cho bạn đọc mượn sách' },
    { key: 'return', icon: IconBookDownload, title: 'Nhận trả sách', text: 'Mở sổ mượn / trả', to: '/borrows' },
    { key: 'book', icon: IconPlus, title: 'Nhập sách mới', text: 'Thêm vào kho' },
    { key: 'card', icon: IconId, title: 'Cấp thẻ', text: 'Cho độc giả mới' },
  ];

  return (
    <>
      <PageHeader title="Quầy thủ thư" subtitle="Chủ nhật, 08/11/2026 · ca sáng" />
      <div className="page-body">
        <div className="container-xl">
          <div className="row g-3 mb-4">
            {quick.map(({ key, icon: Icon, title, text, to }) => (
              <div key={key} className="col-6 col-lg-3">
                {to ? (
                  <Link to={to} className="quick h-100"><span className="ico"><Icon size={20} /></span><b>{title}</b><span className="small text-secondary">{text}</span></Link>
                ) : (
                  <button type="button" className="quick w-100 h-100" onClick={() => setModal(key)}><span className="ico"><Icon size={20} /></span><b>{title}</b><span className="small text-secondary">{text}</span></button>
                )}
              </div>
            ))}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3"><StatCard label="Cho mượn hôm nay" value={3} highlight /></div>
            <div className="col-6 col-lg-3"><StatCard label="Nhận trả hôm nay" value={2} /></div>
            <div className="col-6 col-lg-3"><StatCard label="Sắp đến hạn" value={attention.length - 1} hint="trong 3 ngày tới" /></div>
            <div className="col-6 col-lg-3"><StatCard label="Quá hạn" value={1} hint="cần nhắc trả" /></div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card h-100">
                <div className="card-header"><h3 className="card-title">Cần nhắc trả</h3></div>
                <div className="card-body py-1">
                  {attention.map((r) => {
                    const left = daysBetween(TODAY, r.dueDate);
                    return (
                      <div key={r._id} className="task">
                        <span className="avatar avatar-sm">{r.userName.charAt(0)}</span>
                        <div className="flex-fill lh-sm">
                          <div className="fw-bold">{r.userName}</div>
                          <div className="small text-secondary">{r.bookTitle} · hạn {r.dueDate}</div>
                        </div>
                        {left < 0
                          ? <StatusBadge value="overdue" map={BORROW_STATUS} />
                          : <span className="pill pill-amber">còn {left} ngày</span>}
                        <button className="btn btn-sm btn-outline" type="button"><IconBellRinging size={15} className="me-1" /> Nhắc</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card h-100">
                <div className="card-header"><h3 className="card-title">Sách sắp hết</h3></div>
                <div className="card-body py-1">
                  {lowStock.map((b) => (
                    <div key={b._id} className="task">
                      <BookCover book={b} size="sm" />
                      <div className="flex-fill lh-sm">
                        <div className="fw-bold">{b.title}</div>
                        <div className="small text-secondary">{b.author}</div>
                      </div>
                      <span className={`pill ${b.availableCopies ? 'pill-amber' : 'pill-coral'}`}>còn {b.availableCopies}/{b.totalCopies}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BorrowFormModal open={modal === 'borrow'} onClose={close} />
      <BookFormModal open={modal === 'book'} onClose={close} />
      <CardFormModal open={modal === 'card'} onClose={close} />
    </>
  );
}
