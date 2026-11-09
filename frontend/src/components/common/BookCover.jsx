// Bìa sách 3D vẽ bằng CSS (màu lấy từ book.color).
// size: 'sm' (khối màu nhỏ) | 'md' (mặc định, nghiêng 3D) | 'lg' (to) ; flat: không nghiêng
// Khi có ảnh bìa thật thì thay nội dung .book bằng <img>.
export default function BookCover({ book, size = 'md', flat = false }) {
  const wrapClass = ['book-3d', size === 'sm' && 'book-sm', size === 'lg' && 'book-lg', flat && 'book-flat']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapClass}>
      <div className="book" style={{ background: book.color || '#d8ff5c', color: book.ink || '#0e1a14' }}>
        {size !== 'sm' && (
          <>
            <span className="book-title">{book.title}</span>
            <span className="book-author">{book.author}</span>
          </>
        )}
      </div>
    </div>
  );
}
