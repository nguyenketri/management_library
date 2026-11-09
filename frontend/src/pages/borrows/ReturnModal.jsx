import { useState } from 'react';
import Modal from '../../components/common/Modal';
import BookCover from '../../components/common/BookCover';
import borrowApi from '../../api/borrowApi';
import { FINE_PER_DAY } from '../../constants/sampleData';

const localToday = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
const money = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

export default function ReturnModal({ borrow, onClose, onDone }) {
  const [returned, setReturned] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const record = returned || borrow;
  const lateDays = record.status === 'returned'
    ? Math.max(0, daysBetween(record.dueDate, record.returnDate))
    : Math.max(0, daysBetween(record.dueDate, localToday()));
  const fine = record.status === 'returned' ? record.fine : (record.fine || lateDays * FINE_PER_DAY);
  const book = { title: record.bookTitle, color: '#d8ff5c' };

  const finish = async (paidNow) => {
    setSaving(true);
    setError('');
    try {
      let updated = returned;
      if (!updated) {
        updated = await borrowApi.returnBook(record._id);
        setReturned(updated);
        onDone(updated);
      }
      if (paidNow && updated.fine > 0) {
        updated = await borrowApi.payFine(updated._id);
        onDone(updated);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    ['Bạn đọc', record.userName],
    ['Ngày mượn', record.borrowDate],
    ['Hạn trả', record.dueDate],
    ['Ngày trả', record.returnDate || `${localToday()} (hôm nay)`],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title="Nhận trả sách"
      width={500}
      footer={fine > 0 && !record.finePaid ? (
        <>
          <button type="button" className="btn btn-outline" onClick={() => finish(false)} disabled={saving}>Nhận trả, để nợ</button>
          <button type="button" className="btn btn-primary" onClick={() => finish(true)} disabled={saving}>
            {saving ? 'Đang xử lý…' : returned ? 'Thu tiền phạt' : 'Đã thu tiền & nhận trả'}
          </button>
        </>
      ) : (
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Hủy</button>
          <button type="button" className="btn btn-primary" onClick={() => finish(false)} disabled={saving}>
            {saving ? 'Đang xử lý…' : returned ? 'Đóng' : 'Xác nhận nhận trả'}
          </button>
        </>
      )}
    >
      {error && <div className="form-error mb-3">{error}</div>}
      <div className="d-flex gap-3 mb-4">
        <BookCover book={book} size="sm" />
        <div className="flex-fill">
          <div className="fw-bold fs-3 mb-2">{record.bookTitle}</div>
          {rows.map(([label, value]) => (
            <div key={label} className="d-flex justify-content-between small py-1">
              <span className="text-secondary">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {fine > 0 ? (
        <div className="fine-box">
          <div className="d-flex justify-content-between align-items-end">
            <div>
              <div className="small fw-bold">Trả trễ {lateDays} ngày</div>
              <div className="small opacity-75">{lateDays} ngày × {money(FINE_PER_DAY)}</div>
            </div>
            <div className="fine-amount">{money(fine)}</div>
          </div>
          <div className="small mt-2 opacity-75">
            {returned ? 'Sách đã được nhận trả. Có thể thu tiền phạt tại quầy hoặc để độc giả nộp sau.' : 'Thu tiền mặt ngay thì bấm "Đã thu tiền". Chưa thu được thì để nợ – độc giả chưa nộp sẽ không thể mượn sách mới.'}
          </div>
        </div>
      ) : (
        <div className="form-success">Trả đúng hạn, không có tiền phạt.</div>
      )}
    </Modal>
  );
}
