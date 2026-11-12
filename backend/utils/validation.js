const badRequest = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
};
const bodyObject = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) badRequest('Dữ liệu gửi lên phải là object');
    return value;
};
const text = (value, label, max, required = false) => {
    if (typeof value !== 'string') badRequest(`${label} phải là chuỗi`);
    const result = value.trim();
    if (required && !result) badRequest(`Vui lòng nhập ${label}`);
    if (result.length > max) badRequest(`${label} không được vượt quá ${max} ký tự`);
    return result;
};
const integer = (value, label, min, max = Number.MAX_SAFE_INTEGER) => {
    if (!['string', 'number'].includes(typeof value) || (typeof value === 'string' && !/^\d+$/.test(value.trim()))) {
        badRequest(`${label} phải là số nguyên từ ${min} đến ${max}`);
    }
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < min || number > max) badRequest(`${label} phải là số nguyên từ ${min} đến ${max}`);
    return number;
};
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bookData = (body, creating = false) => {
    bodyObject(body);
    const data = {};
    for (const [key, label, max, required] of [
        ['title', 'Tên sách', 200, true], ['author', 'Tác giả', 150, true],
        ['category', 'Danh mục', 100, true], ['publisher', 'Nhà xuất bản', 200, false],
        ['isbn', 'ISBN', 32, false], ['description', 'Mô tả', 5000, false],
    ]) {
        if (body[key] !== undefined || (creating && required)) data[key] = text(body[key], label, max, required);
    }
    if (data.isbn === '') delete data.isbn;
    for (const [key, label, min, max] of [
        ['totalCopies', 'Tổng số lượng', 0], ['availableCopies', 'Số lượng khả dụng', 0],
        ['pages', 'Số trang', 1], ['publishedYear', 'Năm xuất bản', 1, new Date().getFullYear()],
    ]) {
        if (body[key] !== undefined) data[key] = integer(body[key], label, min, max);
    }
    if (creating) {
        data.totalCopies ??= 1;
        data.availableCopies ??= data.totalCopies;
    }
    return data;
};
const reviewRating = (value) => {
    if (!['number', 'string'].includes(typeof value) || String(value).trim() === '') badRequest('Điểm đánh giá không hợp lệ');
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0.5 || number > 5 || !Number.isInteger(number * 2)) {
        badRequest('Điểm đánh giá từ 0,5 đến 5 sao, theo bước 0,5');
    }
    return number;
};
module.exports = { badRequest, bodyObject, text, integer, escapeRegex, bookData, reviewRating };
