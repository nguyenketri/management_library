# FU Library – Quản lý thư viện
Đồ án SDN302 · Node.js, Express, MongoDB (Mongoose) · React (Vite)

## Chạy dự án
Cần: Node.js 20+, MongoDB ở `127.0.0.1:27017` đã import dữ liệu mẫu (gửi riêng) vào database `management_library`.

```bash
cd backend
npm install
cp .env.example .env
npm start            # http://localhost:5000/api
```

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Tài khoản mẫu (mật khẩu `password123`): `admin@library.edu.vn`, `librarian@library.edu.vn`, `manager@library.edu.vn`, `namlh@fpt.edu.vn`

## Cấu trúc
```text
backend/
├── DAL/database.js     # kết nối MongoDB
├── models/             # xxx.model.js
├── controllers/        # xxx.controller.js
├── routes/             # xxx.route.js + index.js
├── middlewares/        # auth (JWT), error
└── server.js

frontend/src/
├── api/                # gọi backend (axiosClient + xxxApi.js)
├── layouts/            # khung trang: sidebar, topbar
├── components/common/  # component dùng chung
├── pages/              # mỗi màn hình 1 thư mục
├── routes/             # khai báo đường dẫn
├── constants/          # menu, dữ liệu mẫu (xóa khi nối API)
└── styles/app.css      # giao diện
```
