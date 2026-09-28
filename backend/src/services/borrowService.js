const mongoose = require('mongoose');
const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const { mockDB } = require('../mock/mockData');
const bookService = require('./bookService');

const isMongoConnected = () => mongoose.connection.readyState === 1;

// 1. Lấy tất cả phiếu mượn sách
const getAllBorrowRecords = async (status) => {
  if (isMongoConnected()) {
    const query = status ? { status } : {};
    return await BorrowRecord.find(query).sort({ createdAt: -1 });
  }

  let list = [...mockDB.borrows];
  if (status && status !== 'All') {
    list = list.filter((b) => b.status === status);
  }
  return list;
};

// 2. Mượn sách (Tạo phiếu mượn và giảm 1 cuốn có sẵn trong kho)
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

  if (isMongoConnected()) {
    return await BorrowRecord.create({
      userId,
      userName,
      bookId,
      bookTitle: book.title,
      borrowDate,
      dueDate: calculatedDueDate,
      status: 'borrowed',
      notes,
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
    createdAt: new Date(),
  };

  mockDB.borrows.unshift(newBorrow);
  return newBorrow;
};

// 3. Trả sách (Đánh dấu đã trả và cộng lại 1 cuốn vào kho)
const returnBook = async (borrowId) => {
  let borrowRecord = null;

  if (isMongoConnected()) {
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
  if (isMongoConnected()) {
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
  borrowBook,
  returnBook,
};
