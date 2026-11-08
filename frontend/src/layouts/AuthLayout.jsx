// Người phụ trách: Phần xác thực (làm riêng)
import { Outlet, Link } from 'react-router-dom';
import BookCover from '../components/common/BookCover';
import { BOOKS } from '../constants/sampleData';

// Khung đăng nhập / đăng ký: nửa trái khối lime + sách 3D, nửa phải là form
export default function AuthLayout() {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Link to="/" className="lp-logo">fu<b>.</b>library</Link>
        <div className="auth-books">
          <BookCover book={{ ...BOOKS[1], color: '#0e1a14', ink: '#d8ff5c' }} size="lg" />
        </div>
        <h2>Một tấm thẻ.<br />Cả nghìn<br />cuốn sách.</h2>
        <p className="mb-0">Mở cửa 7:30 – 21:00, mỗi ngày.</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
