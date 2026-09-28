// Middleware xử lý 404 Not Found
const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy đường dẫn - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware xử lý lỗi tổng quát
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message;

  // Lỗi CastError của Mongoose (ví dụ ObjectId không hợp lệ)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Tài nguyên không tìm thấy (ID không hợp lệ)';
  }

  // Lỗi Duplicate Key của Mongoose (ví dụ trùng ISBN)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Dữ liệu đã tồn tại (trùng lặp khóa)';
  }

  // Lỗi Validation của Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFound,
  errorHandler,
};
