import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';

// Ô chọn tự vẽ theo giao diện web (thay cho <select> của trình duyệt).
//
// Cách dùng:
//   <Select
//     value={form.role}                                   // giá trị đang chọn (bỏ trống thì dùng defaultValue)
//     onChange={(value) => setForm({ ...form, role: value })}
//     options={[{ value: 'admin', label: 'Quản trị' }, { value: 'x', label: 'Hết', disabled: true }]}
//     placeholder="Chọn vai trò"
//   />
export default function Select({ value, defaultValue, onChange, options, placeholder = 'Chọn…', disabled = false }) {
  const [innerValue, setInnerValue] = useState(defaultValue ?? options[0]?.value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);     // mục đang được tô khi dùng phím mũi tên
  const [position, setPosition] = useState(null);

  const buttonRef = useRef(null);
  const listRef = useRef(null);

  const current = value !== undefined ? value : innerValue;
  const selected = options.find((o) => o.value === current);

  // Mở danh sách ngay bên dưới ô chọn (gắn vào body để không bị modal cắt mất)
  const openList = () => {
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
    setActive(Math.max(0, options.findIndex((o) => o.value === current)));
    setOpen(true);
  };

  const closeList = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const choose = (option) => {
    if (!option || option.disabled) return;
    if (value === undefined) setInnerValue(option.value);
    onChange?.(option.value);
    closeList();
  };

  // Bấm ra ngoài / cuộn trang / đổi cỡ cửa sổ thì đóng danh sách
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (!buttonRef.current.contains(e.target) && !listRef.current?.contains(e.target)) setOpen(false);
    };
    const handleScroll = (e) => {
      if (!listRef.current?.contains(e.target)) setOpen(false);
    };
    const close = () => setOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  // Bàn phím: Enter / Space / ↓ để mở, ↑ ↓ để di chuyển, Enter để chọn, Esc để đóng
  const handleKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }

    const move = (step) => {
      let i = active;
      do {
        i = (i + step + options.length) % options.length;
      } while (options[i].disabled && i !== active);
      setActive(i);
    };

    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[active]); }
    if (e.key === 'Escape' || e.key === 'Tab') setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`select-btn ${open ? 'is-open' : ''}`}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? '' : 'select-placeholder'}>{selected ? selected.label : placeholder}</span>
        <IconChevronDown size={17} className="select-arrow" />
      </button>

      {open && position && createPortal(
        <ul ref={listRef} className="select-list" role="listbox" style={position}>
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === current}
              aria-disabled={o.disabled}
              className={[
                'select-option',
                o.value === current && 'is-selected',
                i === active && 'is-active',
                o.disabled && 'is-disabled',
              ].filter(Boolean).join(' ')}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(o)}
            >
              <span className="text-truncate">{o.label}</span>
              {o.value === current && <IconCheck size={16} />}
            </li>
          ))}
          {options.length === 0 && <li className="select-option is-disabled">Không có lựa chọn</li>}
        </ul>,
        document.body
      )}
    </>
  );
}
