// models/borrow.model.js - collection "borrows" (Phiếu mượn / trả)
// Người phụ trách: Người 3
//
// Vòng đời 1 phiếu:
//   pending  (độc giả đặt mượn online)
//     ├─ rejected (thủ thư từ chối, ghi lý do)
//     └─ borrowed (thủ thư duyệt khi độc giả đến nhận sách -> trừ 1 cuốn trên kệ)
//          └─ returned (trả sách -> cộng lại 1 cuốn)
//   overdue: phiếu borrowed đã quá dueDate (có thể tính theo ngày, không bắt buộc lưu)
//   Thủ thư lập phiếu trực tiếp tại quầy thì tạo luôn ở trạng thái borrowed.
//
// Tiền phạt (thu TIỀN MẶT tại quầy):
//   Trả trễ -> fine = số ngày trễ x 5.000đ, finePaid = false
//   Thủ thư thu tiền -> finePaid = true, finePaidAt = ngày thu
//   Còn phiếu fine > 0 mà finePaid = false thì độc giả không được đặt mượn sách mới
const { Schema, model } = require('mongoose');

const borrowSchema = new Schema({
    userId: {
        type: String,
        required: [true, 'Vui lòng cung cấp thông tin người mượn'],
    },
    userName: {
        type: String,
        required: true,
    },
    bookId: {
        type: String,
        required: [true, 'Vui lòng cung cấp thông tin cuốn sách'],
    },
    bookTitle: {
        type: String,
        required: true,
    },
    // Các ngày lưu dạng chuỗi YYYY-MM-DD
    requestDate: { type: String, default: null },   // ngày độc giả đặt mượn
    borrowDate: { type: String, default: null },    // ngày nhận sách (lúc thủ thư duyệt)
    dueDate: { type: String, default: null },       // hạn trả = borrowDate + 14 ngày
    returnDate: { type: String, default: null },
    status: {
        type: String,
        enum: ['pending', 'rejected', 'borrowed', 'returned', 'overdue'],
        default: 'pending',
    },
    rejectReason: { type: String, trim: true },     // lý do khi thủ thư từ chối
    renewalCount: { type: Number, default: 0 },     // số lần đã gia hạn (tối đa 1)
    // Tiền phạt trả trễ - nộp tiền mặt tại quầy
    fine: { type: Number, default: 0, min: [0, 'Tiền phạt không thể âm'] },
    finePaid: { type: Boolean, default: false },
    finePaidAt: { type: String, default: null },    // ngày thu tiền phạt (YYYY-MM-DD)
    notes: {
        type: String,
        trim: true,
    },
}, {
    collection: 'borrows',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const Borrow = model('Borrow', borrowSchema);
module.exports = Borrow;
