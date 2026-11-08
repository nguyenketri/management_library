// Người phụ trách: Phần xác thực (làm riêng)
// TODO: gọi authApi.register
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-2">Làm thẻ bạn đọc.</h1>
      <p className="text-secondary mb-5">Miễn phí cho sinh viên. Mất chưa tới một phút.</p>

      <form autoComplete="off" noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="name">Họ và tên</label>
          <input id="name" type="text" className="form-control" placeholder="Nguyễn Văn A" />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label" htmlFor="sid">MSSV</label>
            <input id="sid" type="text" className="form-control" placeholder="SE170001" />
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="phone">Điện thoại</label>
            <input id="phone" type="text" className="form-control" placeholder="09xx xxx xxx" />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="remail">Email</label>
          <input id="remail" type="email" className="form-control" placeholder="ban@fpt.edu.vn" />
        </div>
        <div className="mb-4">
          <label className="form-label" htmlFor="rpass">Mật khẩu</label>
          <input id="rpass" type="password" className="form-control" placeholder="Tối thiểu 6 ký tự" />
        </div>
        <button type="button" className="btn btn-primary btn-lg w-100">Tạo tài khoản</button>
      </form>

      <p className="text-secondary text-center mt-4 mb-0">
        Đã có thẻ? <Link to="/login" className="fw-bold">Đăng nhập</Link>
      </p>
    </>
  );
}
