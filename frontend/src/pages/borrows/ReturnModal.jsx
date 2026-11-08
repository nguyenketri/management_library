// Người phụ trách: Người 3 (Mượn trả & thu phạt)
// Hộp xác nhận nhận trả sách: tính số ngày trễ + tiền phạt, cho chọn thu tiền luôn hoặc để nợ.
// TODO: gọi PUT /api/borrows/:id/return (và PATCH /api/borrows/:id/pay-fine nếu thu luôn)
import Modal from '../../components/common/Modal';
import BookCover from '../../components/common/BookCover';
import { BOOKS, TODAY, FINE_PER_DAY } from '../../constants/sampleData';

const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
const money = (n) => n.toLocaleString('vi-VN') + 'đ';

// onDone(phiếu sau khi trả) – trang cha cập nhật lại danh sách
export default function ReturnModal({ borrow, onClose, onDone }) {
  const book = BOOKS.find((b) => b._id === borrow.bookId);
  const lateDays = Math.max(0, daysBetween(borrow.dueDate, TODAY));
  const fine = lateDays * FINE_PER_DAY;

  const finish = (paidNow) => {
    onDone({
      ...borrow,
      status: 'returned',
      returnDate: TODAY,
      fine,
      finePaid: fine === 0 ? false : paidNow,
      finePaidAt: paidNow && fine > 0 ? TODAY : null,
    });
  };

  const rows = [
    ['Bạn đọc', borrow.userName],
    ['Ngày mượn', borrow.borrowDate],
    ['Hạn trả', borrow.dueDate],
    ['Ngày trả', `${TODAY} (hôm nay)`],
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title="Nhận trả sách"
      width={500}
      footer={
        fine > 0 ? (
          <>
            <button type="button" className="btn btn-outline" onClick={() => finish(false)}>Nhận trả, để nợ</button>
            <button type="button" className="btn btn-primary" onClick={() => finish(true)}>Đã thu tiền & nhận trả</button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
            <button type="button" className="btn btn-primary" onClick={() => finish(false)}>Xác nhận nhận trả</button>
          </>
        )
      }
    >
      <div className="d-flex gap-3 mb-4">
        {book && <BookCover book={book} size="sm" />}
        <div className="flex-fill">
          <div className="fw-bold fs-3 mb-2">{borrow.bookTitle}</div>
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
            Thu tiền mặt ngay thì bấm "Đã thu tiền". Chưa thu được thì để nợ – độc giả chưa nộp sẽ không được đặt mượn sách mới.
          </div>
        </div>
      ) : (
        <div className="form-success">Trả đúng hạn, không có tiền phạt.</div>
      )}
    </Modal>
  );
}
