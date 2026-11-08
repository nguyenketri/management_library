const jwt = require('jsonwebtoken');

// Xác thực: bắt buộc có header "Authorization: Bearer <token>"
const verifyToken = (req, resp, next) => {
    try {
        // Lấy Authorization từ Header
        const authHeader = req.headers.authorization;

        // Kiểm tra định dạng Bearer Token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return resp.status(401).json({ error: 'Access denied. No token provided' });
        }

        // Tách lấy token và xác thực
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Lưu payload { id, role, name } vào request để Controller sử dụng
        req.user = decoded;
        next();
    } catch (err) {
        return resp.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Phân quyền: dùng SAU verifyToken. Ví dụ: authorize('admin', 'librarian')
const authorize = (...roles) => (req, resp, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return resp.status(403).json({ error: 'Bạn không có quyền thực hiện chức năng này' });
    }
    next();
};

module.exports = { verifyToken, authorize };
