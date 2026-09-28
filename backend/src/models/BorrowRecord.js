const mongoose = require('mongoose');

// Schema Phiếu mượn / trả sách (Quản lý giao dịch mượn trả)
const borrowRecordSchema = new mongoose.Schema(
  {
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
    borrowDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0], // YYYY-MM-DD
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
      default: 'borrowed', // Mặc định là đang mượn
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
