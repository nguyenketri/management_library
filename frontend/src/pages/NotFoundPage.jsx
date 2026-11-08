import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="landing d-flex align-items-center justify-content-center text-center px-4" style={{ minHeight: '100vh' }}>
      <div>
        <h1 className="lp-title mb-3">4<span className="hl">0</span>4</h1>
        <p className="lp-sub mx-auto mb-4">Cuốn sách bạn tìm đã được ai đó mượn mất rồi.</p>
        <Link to="/" className="btn btn-primary btn-lg">Về trang chủ</Link>
      </div>
    </div>
  );
}
