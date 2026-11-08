// Người phụ trách: Phần xác thực (làm riêng)
// TODO: gọi authApi.login, lưu token + user, chuyển về /dashboard
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-2">Chào mừng trở lại.</h1>
      <p className="text-secondary mb-5">Đăng nhập để mượn sách và theo dõi hạn trả.</p>

      <form autoComplete="off" noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="form-control" placeholder="ban@fpt.edu.vn" />
        </div>
        <div className="mb-4">
          <div className="d-flex justify-content-between">
            <label className="form-label" htmlFor="password">Mật khẩu</label>
            <a href="#" className="small">Quên mật khẩu?</a>
          </div>
          <input id="password" type="password" className="form-control" placeholder="••••••••" />
        </div>
        <button type="button" className="btn btn-primary btn-lg w-100">Đăng nhập</button>
      </form>

      <p className="text-secondary text-center mt-4 mb-0">
        Chưa có thẻ? <Link to="/register" className="fw-bold">Làm thẻ miễn phí</Link>
      </p>
    </>
  );
}
