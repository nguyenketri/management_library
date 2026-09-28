# 📚 HỆ THỐNG QUẢN LÝ THƯ VIỆN (LIBRARY MANAGEMENT SYSTEM)
> **Đồ án môn SDN302** (Server-side Web Development with Node.js & React)  
> Kiến trúc chuẩn MVC & Service Layer &bull; Giao diện ReactJS kết hợp Bootstrap &bull; Hỗ trợ MongoDB & Mock DB

---

## 🔐 Tài Khoản Đăng Nhập Mẫu (5 Người Đại Diện)

Hệ thống đã có sẵn 5 tài khoản mẫu để bạn và thầy cô đăng nhập thử nghiệm ngay lập tức (Mật khẩu chung: `password123`):

| Vai Trò | Tên Người Dùng | Email Đăng Nhập | Mật Khẩu | Quyền Hạn |
| :--- | :--- | :--- | :---: | :--- |
| **👑 Admin** | Nguyễn Văn Quản Trị | `admin@library.edu.vn` | `password123` | Toàn quyền: Thêm/Sửa/Xóa sách, duyệt mượn trả, xem thành viên |
| **📚 Thủ thư** | Trần Thị Thủ Thư | `librarian@library.edu.vn` | `password123` | Quản lý sách, lập phiếu mượn và duyệt trả sách |
| **🎓 Độc giả 1** | Lê Hoàng Nam | `namlh@fpt.edu.vn` | `password123` | Tra cứu sách, tạo yêu cầu mượn sách, xem hạn trả |
| **🎓 Độc giả 2** | Phạm Minh Anh | `anhpm@fpt.edu.vn` | `password123` | Tra cứu sách, tạo yêu cầu mượn sách, xem hạn trả |
| **🎓 Độc giả 3** | Đặng Tuấn Kiệt | `kietdt@fpt.edu.vn` | `password123` | Tra cứu sách, tạo yêu cầu mượn sách, xem hạn trả |

> **💡 Tính năng phím tắt tiện lợi:** Trong Modal Đăng nhập có sẵn các nút bấm 1-click (👑 Admin, 📚 Thủ thư, 🎓 Sinh viên) để tự động điền tài khoản mà không cần gõ phím!

---

## 📁 Cấu Trúc Toàn Dự Án

```text
Management_Library/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # Kết nối MongoDB (Hỗ trợ tự chuyển Mock DB)
│   │   ├── mock/
│   │   │   └── mockData.js         # Dữ liệu giả lập 5 Users, Sách, Phiếu mượn
│   │   ├── models/
│   │   │   ├── Book.js             # Schema Sách
│   │   │   ├── User.js             # Schema Người dùng (có password, role)
│   │   │   └── BorrowRecord.js     # Schema Phiếu mượn / trả
│   │   ├── services/
│   │   │   ├── authService.js      # Xử lý Đăng ký / Đăng nhập
│   │   │   ├── bookService.js      # Xử lý nghiệp vụ Sách
│   │   │   ├── userService.js      # Xử lý thông tin thành viên
│   │   │   └── borrowService.js    # Xử lý Mượn / Trả sách
│   │   ├── controllers/
│   │   │   ├── authController.js   # Tiếp nhận req/res Auth
│   │   │   ├── bookController.js   # Tiếp nhận req/res Sách
│   │   │   ├── userController.js   # Tiếp nhận req/res Thành viên
│   │   │   └── borrowController.js # Tiếp nhận req/res Mượn trả
│   │   ├── routes/
│   │   │   ├── index.js            # Router trung gian tổng (/api/...)
│   │   │   ├── authRoutes.js       # /api/auth (login, register)
│   │   │   ├── bookRoutes.js       # /api/books
│   │   │   ├── userRoutes.js       # /api/users
│   │   │   └── borrowRoutes.js     # /api/borrows
│   │   ├── middlewares/
│   │   │   └── errorHandler.js     # Middleware bắt lỗi toàn cục
│   │   └── server.js               # Điểm khởi động Express Server
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── frontend/                       # ReactJS + Bootstrap
│   ├── src/
│   │   ├── api/                    # Tầng gọi API (axiosClient, authApi, bookApi...)
│   │   ├── components/             # Components UI (Navbar, AuthModal, BooksView...)
│   │   ├── constants/              # Dữ liệu mẫu đồng bộ (libraryData.js)
│   │   ├── pages/
│   │   │   └── HomePage.jsx        # Trang chủ điều phối
│   │   ├── App.jsx
│   │   ├── index.css               # Styling tùy biến
│   │   └── main.jsx                # Nhúng Bootstrap CSS toàn cục
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

---

## 📡 Danh Sách API Backend (RESTful)

| Phương Thức | Endpoint | Mô Tả |
| :---: | :--- | :--- |
| `POST` | `/api/auth/login` | Đăng nhập tài khoản (email, password) |
| `POST` | `/api/auth/register` | Đăng ký thành viên mới |
| `GET` | `/api/health` | Kiểm tra trạng thái hoạt động của server |
| `GET` | `/api/books` | Lấy danh sách sách (`?keyword=...&category=...`) |
| `GET` | `/api/books/:id` | Lấy chi tiết sách |
| `POST` | `/api/books` | Thêm sách mới (Admin / Thủ thư) |
| `PUT` | `/api/books/:id` | Cập nhật sách |
| `DELETE` | `/api/books/:id` | Xóa sách |
| `GET` | `/api/borrows` | Lấy danh sách phiếu mượn (`?status=...`) |
| `POST` | `/api/borrows` | Lập phiếu mượn sách mới |
| `PUT` | `/api/borrows/:id/return` | Xác nhận trả sách |
| `GET` | `/api/users` | Lấy danh sách 5 thành viên |

---

## 🚀 Hướng Dẫn Khởi Chạy

```bash
# 1. Khởi chạy Backend (Terminal 1)
cd backend
npm run dev

# 2. Khởi chạy Frontend (Terminal 2)
cd frontend
npm run dev
```
Mở trình duyệt tại: `http://localhost:5173`
