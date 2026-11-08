import { IconX } from '@tabler/icons-react';

// Hộp thoại dùng chung:
// <Modal open={open} title="Thêm sách" onClose={() => setOpen(false)} footer={<button/>}>...</Modal>
export default function Modal({ open, title, onClose, children, footer, width = 560 }) {
  if (!open) return null;

  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <div className="app-modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="app-modal-head">
          <h3 className="mb-0">{title}</h3>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Đóng"><IconX size={19} /></button>
        </div>
        <div className="app-modal-body">{children}</div>
        {footer && <div className="app-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
