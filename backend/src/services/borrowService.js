const mongoose = require('mongoose');
const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const { mockDB } = require('../mock/mockData');
const bookService = require('./bookService');

const isMongoConnected = () => mongoose.connection.readyState === 1;
const shouldUseMockDB = async (Model) => {
  if (!isMongoConnected()) {
    return true;
  }

  try {
    const count = await Model.countDocuments();
    return count === 0;
  } catch (error) {
    return true;
  }
};

const addDays = (dateString, days) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// 1. Lấy tất cả phiếu mượn sách
const getAllBorrowRecords = async (status) => {
  if (isMongoConnected() && !(await shouldUseMockDB(BorrowRecord))) {
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

  if (isMongoConnected() && !(await shouldUseMockDB(BorrowRecord))) {
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

  if (isMongoConnected() && !(await shouldUseMockDB(BorrowRecord))) {
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

  if (isMongoConnected() && !(await shouldUseMockDB(BorrowRecord))) {
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

  const today = new Date();
  const dueDate = new Date(borrowRecord.dueDate);
  if (today > dueDate) {
    throw new Error('Sách đã quá hạn, không thể gia hạn thêm!');
  }

  const renewalCount = Number(borrowRecord.renewalCount || 0);
  if (renewalCount >= 1) {
    throw new Error('Bạn đã gia hạn tối đa 1 lần cho cuốn sách này!');
  }

  const newDueDate = addDays(borrowRecord.dueDate, 7);

  if (isMongoConnected() && !(await shouldUseMockDB(BorrowRecord))) {
    borrowRecord.dueDate = newDueDate;
    borrowRecord.renewalCount = renewalCount + 1;
    await borrowRecord.save();
  } else {
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

  const items = history.map((record) => {
    const dueDate = new Date(record.dueDate);
    const returnDate = record.returnDate ? new Date(record.returnDate) : new Date();
    const overdueDays = record.status === 'returned' || record.status === 'borrowed'
      ? Math.max(0, Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24)))
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
  // 1. Kiểm tra sách có sẵn không
  const book = await bookService.getBookById(bookId);
  if (!book) {
    throw new Error('Không tìm thấy sách yêu cầu');
  }

  if (book.availableCopies <= 0) {
    throw new Error(`Sách "${book.title}" hiện tại đã hết, không thể mượn!`);
  }

  // 2. Giảm số lượng có sẵn đi 1
  await bookService.updateBook(bookId, {
    availableCopies: book.availableCopies - 1,
  });

  const borrowDate = new Date().toISOString().split('T')[0];
  const calculatedDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 14 ngày

  if (isMongoConnected() && !(await shouldUseMockDB(BorrowRecord))) {
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
};

// 7. Trả sách (Đánh dấu đã trả và cộng lại 1 cuốn vào kho)
const returnBook = async (borrowId) => {
  let borrowRecord = null;

  if (isMongoConnected() && !(await shouldUseMockDB(BorrowRecord))) {
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

  const today = new Date().toISOString().split('T')[0];

  // 1. Cập nhật phiếu mượn thành đã trả
  if (isMongoConnected() && !(await shouldUseMockDB(BorrowRecord))) {
    borrowRecord.status = 'returned';
    borrowRecord.returnDate = today;
    await borrowRecord.save();
  } else {
    borrowRecord.status = 'returned';
    borrowRecord.returnDate = today;
  }

  // 2. Tăng số lượng khả dụng của sách lên 1
  const book = await bookService.getBookById(borrowRecord.bookId);
  if (book) {
    const newAvailable = Math.min(book.totalCopies, (book.availableCopies || 0) + 1);
    await bookService.updateBook(borrowRecord.bookId, {
      availableCopies: newAvailable,
    });
  }

  return borrowRecord;
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
