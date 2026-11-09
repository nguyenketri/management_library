import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import bookApi from '../../api/bookApi';
import borrowApi from '../../api/borrowApi';
import userApi from '../../api/userApi';

const localDate = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const defaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return localDate(date);
};

export default function BorrowFormModal({ open, onClose, onCreated }) {
  const [readers, setReaders] = useState([]);
  const [books, setBooks] = useState([]);
  const [userId, setUserId] = useState('');
  const [bookId, setBookId] = useState('');
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [borrowDate] = useState(() => localDate(new Date()));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const close = () => {
    setError('');
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    Promise.all([userApi.getAll({ role: 'member' }), bookApi.getAll()])
      .then(([members, inventory]) => {
        setReaders(members);
        setBooks(inventory);
        setUserId(members[0]?._id || '');
        const available = inventory.find((book) => book.availableCopies > 0);
        setBookId(available?._id || '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  const submit = async () => {
    if (!userId || !bookId || !dueDate) {
      setError('Vui lòng chọn bạn đọc, sách và hạn trả.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const borrow = await borrowApi.borrow({ userId, bookId, dueDate, notes });
      onCreated(borrow);
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedReader = readers.find((reader) => reader._id === userId);

  return (
    <Modal
      open={open}
      onClose={close}
      title="Lập phiếu mượn"
      footer={(
        <>
          <button type="button" className="btn btn-ghost" onClick={close}>Hủy</button>
          <button type="button" className="btn btn-primary" onClick={submit} disabled={loading || saving || !readers.length || !books.some((book) => book.availableCopies > 0)}>
            {saving ? 'Đang lưu…' : 'Lập phiếu'}
          </button>
        </>
      )}
    >
      {error && <div className="form-error mb-3">{error}</div>}
      {loading ? <div className="text-secondary">Đang tải bạn đọc và sách…</div> : (
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Bạn đọc</label>
            <Select
              value={userId}
              onChange={setUserId}
              options={readers.map((reader) => ({ value: reader._id, label: `${reader.name}${reader.studentId ? ` · ${reader.studentId}` : ''}` }))}
              placeholder="Chọn bạn đọc"
            />
          </div>
          <div className="col-12">
            <label className="form-label">Sách</label>
            <Select
              value={bookId}
              onChange={setBookId}
              options={books.map((book) => ({
                value: book._id,
                label: `${book.title} ${book.availableCopies === 0 ? '(hết sách)' : `(còn ${book.availableCopies})`}`,
                disabled: book.availableCopies === 0,
              }))}
              placeholder="Chọn sách"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Ngày lập phiếu</label>
            <input type="date" className="form-control" value={borrowDate} readOnly />
          </div>
          <div className="col-md-6">
            <label className="form-label">Hạn trả</label>
            <input type="date" className="form-control" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
          <div className="col-12"><label className="form-label">Ghi chú</label><input className="form-control" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Không bắt buộc" /></div>
          {selectedReader && <div className="col-12 small text-secondary">Mỗi bạn đọc được mượn tối đa 5 cuốn. Phiếu mới sẽ bị từ chối nếu còn tiền phạt chưa nộp.</div>}
        </div>
      )}
    </Modal>
  );
}
