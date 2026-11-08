// Người phụ trách: Người 2 (Kho sách)
// TODO: điền sẵn dữ liệu khi sửa, gọi bookApi.create / bookApi.update
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import { CATEGORIES } from '../../constants/sampleData';

export default function BookFormModal({ open, onClose, book }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={book ? 'Sửa thông tin sách' : 'Thêm sách mới'}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button type="button" className="btn btn-primary">{book ? 'Lưu thay đổi' : 'Thêm sách'}</button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-12"><label className="form-label">Tên sách</label><input className="form-control" defaultValue={book?.title} placeholder="Clean Code" /></div>
        <div className="col-md-7"><label className="form-label">Tác giả</label><input className="form-control" defaultValue={book?.author} placeholder="Robert C. Martin" /></div>
        <div className="col-md-5"><label className="form-label">Năm xuất bản</label><input type="number" className="form-control" defaultValue={book?.publishedYear} placeholder="2008" /></div>
        <div className="col-md-7">
          <label className="form-label">Danh mục</label>
          <Select
            defaultValue={book?.category}
            options={CATEGORIES.map((c) => ({ value: c.name, label: c.name }))}
          />
        </div>
        <div className="col-md-5"><label className="form-label">Số lượng</label><input type="number" min="0" className="form-control" defaultValue={book?.totalCopies ?? 1} /></div>
        <div className="col-12"><label className="form-label">ISBN</label><input className="form-control" defaultValue={book?.isbn} placeholder="978-0132350884" /></div>
        <div className="col-12"><label className="form-label">Mô tả</label><textarea className="form-control" rows={3} defaultValue={book?.description} /></div>
      </div>
    </Modal>
  );
}
