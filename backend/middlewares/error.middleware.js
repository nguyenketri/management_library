// 404 - không có route nào khớp
const notFound = (req, resp, next) => {
    resp.status(404).json({ error: `Không tìm thấy đường dẫn - ${req.originalUrl}` });
};

// Lỗi chung: controller gọi next(error) sẽ rơi vào đây
const errorHandler = (err, req, resp, next) => {
    let status = err.statusCode || 500;
    let message = err.message;

    // ObjectId sai định dạng
    if (err.name === 'CastError') {
        status = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Trùng khóa unique (email, isbn...)
    if (err.code === 11000) {
        status = 400;
        message = `Dữ liệu đã tồn tại: ${JSON.stringify(err.keyValue)}`;
    }

    // Lỗi validate của Mongoose schema
    if (err.name === 'ValidationError') {
        status = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    }

    if (status === 500) console.error(err);
    resp.status(status).json({ error: message });
};

module.exports = { notFound, errorHandler };
