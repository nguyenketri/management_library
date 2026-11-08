// models/borrow.model.js - collection "borrows" (Phiếu mượn / trả)
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
    // Ngày dạng chuỗi YYYY-MM-DD
    borrowDate: {
        type: String,
        default: () => new Date().toISOString().split('T')[0],
    },
    dueDate: {
        type: String,
        required: true,
    },
    returnDate: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['borrowed', 'returned', 'overdue'],
        default: 'borrowed',
    },
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
