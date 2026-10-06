const mongoose = require('mongoose');
const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const { mockDB } = require('../mock/mockData');
const bookService = require('./bookService');

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const getTodayDateString = () => new Date().toISOString().slice(0, 10);
const parseDateOnly = (dateString) => {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === dateString ? date : null;
};
const daysBetween = (startDate, endDate) => {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end) return 0;
  return Math.floor((end - start) / DAY_IN_MS);
};
const isMongoConnected = () => mongoose.connection.readyState === 1;
const shouldUseMockDB = async () => {
  if (!isMongoConnected()) {
    return true;
  }

  try {
    const count = await Book.countDocuments();
    return count === 0;
  } catch (error) {
    throw error;
  }
};

const addDays = (dateString, days) => {
  const date = parseDateOnly(dateString);
  if (!date) {
    throw new Error('Ngày hạn trả không hợp lệ!');
  }
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

// 1. Lấy tất cả phiếu mượn sách
const getAllBorrowRecords = async (status) => {
  if (isMongoConnected() && !(await shouldUseMockDB())) {
    const query = status ? { status } : {};
    return await BorrowRecord.find(query).sort({ createdAt: -1 });
  }

  let list = [...mockDB.borrows];
  if (status && status !== 'All') {
    list = list.filter((b) => b.status === status);
  }
  return list;
};

// 2. Lấy danh sách sách đang mượn của 1 độc giả
const getMyBorrows = async (userId) => {
  if (!userId) {
    throw new Error('Vui lòng cung cấp ID người dùng!');
  }

  if (isMongoConnected() && !(await shouldUseMockDB())) {
    return await BorrowRecord.find({ userId, status: 'borrowed' }).sort({ dueDate: 1 });
  }

  return mockDB.borrows
    .filter((b) => b.userId === userId && b.status === 'borrowed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

// 3. Lấy lịch sử mượn của 1 độc giả
const getBorrowHistory = async (userId) => {
  if (!userId) {
    throw new Error('Vui lòng cung cấp ID người dùng!');
  }

  if (isMongoConnected() && !(await shouldUseMockDB())) {
    return await BorrowRecord.find({ userId }).sort({ createdAt: -1 });
  }

  return mockDB.borrows
    .filter((b) => b.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// 4. Gia hạn sách đang mượn
const extendBorrow = async (borrowId, userId) => {
  if (!borrowId || !userId) {
    throw new Error('Vui lòng cung cấp ID phiếu mượn và ID người dùng!');
  }

  let borrowRecord = null;

  if (isMongoConnected() && !(await shouldUseMockDB())) {
    borrowRecord = await BorrowRecord.findOne({ _id: borrowId, userId });
  } else {
    borrowRecord = mockDB.borrows.find((b) => b._id === borrowId && b.userId === userId);
  }

  if (!borrowRecord) {
    throw new Error('Không tìm thấy phiếu mượn thuộc về tài khoản của bạn!');
  }

  if (borrowRecord.status !== 'borrowed') {
    throw new Error('Chỉ có thể gia hạn sách đang ở trạng thái đang mượn!');
  }

  if (!parseDateOnly(borrowRecord.dueDate)) {
    throw new Error('Ngày hạn trả của phiếu mượn không hợp lệ!');
  }

  if (getTodayDateString() > borrowRecord.dueDate) {
    throw new Error('Sách đã quá hạn, không thể gia hạn thêm!');
  }

  const renewalCount = Number(borrowRecord.renewalCount || 0);
  if (renewalCount >= 1) {
    throw new Error('Bạn đã gia hạn tối đa 1 lần cho cuốn sách này!');
  }

  const newDueDate = addDays(borrowRecord.dueDate, 7);

  if (isMongoConnected() && !(await shouldUseMockDB())) {
    const updatedRecord = await BorrowRecord.findOneAndUpdate(
      {
        _id: borrowId,
        userId,
        status: 'borrowed',
        dueDate: borrowRecord.dueDate,
        $or: [
          { renewalCount: { $lt: 1 } },
          { renewalCount: { $exists: false } },
        ],
      },
      { $set: { dueDate: newDueDate }, $inc: { renewalCount: 1 } },
      { new: true, runValidators: true }
    );
    if (!updatedRecord) {
      throw new Error('Phiếu mượn đã được gia hạn hoặc không còn đủ điều kiện gia hạn!');
    }
    return updatedRecord;
  } else {
    if (Number(borrowRecord.renewalCount || 0) >= 1 || borrowRecord.status !== 'borrowed') {
      throw new Error('Phiếu mượn đã được gia hạn hoặc không còn đủ điều kiện gia hạn!');
    }
    borrowRecord.dueDate = newDueDate;
    borrowRecord.renewalCount = renewalCount + 1;
  }

  return borrowRecord;
};

// 5. Tính tiền phạt theo lịch sử mượn của độc giả
const getMyPenalties = async (userId) => {
  if (!userId) {
    throw new Error('Vui lòng cung cấp ID người dùng!');
  }

  const history = await getBorrowHistory(userId);
  const penaltyRate = 5000;
  const today = getTodayDateString();

  const items = history.map((record) => {
    const endDate = record.status === 'returned' && record.returnDate
      ? record.returnDate
      : today;
    const overdueDays = ['returned', 'borrowed', 'overdue'].includes(record.status)
      ? Math.max(0, daysBetween(record.dueDate, endDate))
      : 0;

    const amount = overdueDays > 0 ? overdueDays * penaltyRate : 0;

    return {
      _id: record._id,
      bookTitle: record.bookTitle,
      borrowDate: record.borrowDate,
      dueDate: record.dueDate,
      returnDate: record.returnDate,
      overdueDays,
      amount,
      status: record.status,
    };
  }).filter((item) => item.amount > 0);

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return {
    userId,
    total,
    count: items.length,
    items,
  };
};

// 6. Mượn sách (Tạo phiếu mượn và giảm 1 cuốn có sẵn trong kho)
const borrowBook = async ({ userId, userName, bookId, bookTitle, dueDate, notes }) => {
  if (!userId || !userName || !bookId) {
    throw new Error('Vui lòng cung cấp ID người mượn, tên người mượn và ID sách!');
  }

  const borrowDate = getTodayDateString();
  const calculatedDueDate = dueDate || addDays(borrowDate, 14);
  if (!parseDateOnly(calculatedDueDate) || calculatedDueDate < borrowDate) {
    throw new Error('Ngày hạn trả phải đúng định dạng YYYY-MM-DD và không được ở quá khứ!');
  }

  // 1. Kiểm tra sách có sẵn không
  const book = await bookService.getBookById(bookId);
  if (!book) {
    throw new Error('Không tìm thấy sách yêu cầu');
  }

  const reservedBook = await bookService.adjustAvailableCopies(bookId, -1);
  if (!reservedBook) {
    throw new Error(`Sách "${book.title}" hiện tại đã hết, không thể mượn!`);
  }

  try {
    if (isMongoConnected() && !(await shouldUseMockDB())) {
      return await BorrowRecord.create({
        userId,
        userName,
        bookId,
        bookTitle: book.title,
        borrowDate,
        dueDate: calculatedDueDate,
        status: 'borrowed',
        notes,
        renewalCount: 0,
      });
    }

    const newBorrow = {
      _id: `br_${Date.now()}`,
      userId,
      userName,
      bookId,
      bookTitle: book.title,
      borrowDate,
      dueDate: calculatedDueDate,
      returnDate: null,
      status: 'borrowed',
      notes: notes || 'Mượn sách thư viện',
      renewalCount: 0,
      createdAt: new Date(),
    };

    mockDB.borrows.unshift(newBorrow);
    return newBorrow;
  } catch (error) {
    try {
      const restoredBook = await bookService.adjustAvailableCopies(bookId, 1);
      if (!restoredBook) {
        throw new Error('Không thể hoàn lại số lượng sách đã giữ chỗ.');
      }
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        'Không thể tạo phiếu mượn và cũng không thể hoàn lại số lượng sách.'
      );
    }
    throw error;
  }
};

// 7. Trả sách (Đánh dấu đã trả và cộng lại 1 cuốn vào kho)
const returnBook = async (borrowId) => {
  let borrowRecord = null;

  if (isMongoConnected() && !(await shouldUseMockDB())) {
    borrowRecord = await BorrowRecord.findById(borrowId);
  } else {
    borrowRecord = mockDB.borrows.find((b) => b._id === borrowId);
  }

  if (!borrowRecord) {
    throw new Error('Không tìm thấy phiếu mượn để trả sách!');
  }

  if (borrowRecord.status === 'returned') {
    throw new Error('Cuốn sách này đã được trả trước đó rồi!');
  }

  const today = getTodayDateString();
  const previousStatus = borrowRecord.status;
  const previousReturnDate = borrowRecord.returnDate || null;
  let returnedRecord;
  if (isMongoConnected() && !(await shouldUseMockDB())) {
    returnedRecord = await BorrowRecord.findOneAndUpdate(
      { _id: borrowId, status: { $in: ['borrowed', 'overdue'] } },
      { $set: { status: 'returned', returnDate: today } },
      { new: true, runValidators: true }
    );
    if (!returnedRecord) {
      throw new Error('Phiếu mượn đã được trả hoặc không còn hợp lệ!');
    }
  } else {
    borrowRecord.status = 'returned';
    borrowRecord.returnDate = today;
    returnedRecord = borrowRecord;
  }

  try {
    const restoredBook = await bookService.adjustAvailableCopies(borrowRecord.bookId, 1);
    if (!restoredBook) {
      throw new Error('Không thể cập nhật số lượng sách trong kho khi trả sách.');
    }
  } catch (error) {
    try {
      if (isMongoConnected() && !(await shouldUseMockDB())) {
        const restoredRecord = await BorrowRecord.findOneAndUpdate(
          { _id: borrowId, status: 'returned', returnDate: today },
          { $set: { status: previousStatus, returnDate: previousReturnDate } },
          { runValidators: true }
        );
        if (!restoredRecord) {
          throw new Error('Không thể khôi phục trạng thái phiếu mượn sau lỗi cập nhật kho.');
        }
      } else {
        borrowRecord.status = previousStatus;
        borrowRecord.returnDate = previousReturnDate;
      }
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        'Không thể cập nhật kho sách và cũng không thể khôi phục phiếu mượn.'
      );
    }
    throw error;
  }

  return returnedRecord;
};

module.exports = {
  getAllBorrowRecords,
  getMyBorrows,
  getBorrowHistory,
  extendBorrow,
  getMyPenalties,
  borrowBook,
  returnBook,
};
