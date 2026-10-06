const mongoose = require('mongoose');
const Book = require('../models/Book');
const { mockDB } = require('../mock/mockData');

// Hàm kiểm tra xem MongoDB thật có đang kết nối hay không
const isMongoConnected = () => mongoose.connection.readyState === 1;
const shouldUseMockDB = async (Model) => {
  if (!isMongoConnected()) {
    return true;
  }

  try {
    const count = await Model.countDocuments();
    return count === 0;
  } catch (error) {
    throw error;
  }
};

// 1. Lấy danh sách tất cả sách (hỗ trợ tìm kiếm & lọc)
const getAllBooks = async (filter = {}) => {
  const { keyword, category } = filter;

  if (isMongoConnected() && !(await shouldUseMockDB(Book))) {
    const query = {};
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { author: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    return await Book.find(query).sort({ createdAt: -1 });
  }

  // Dùng Mock DB
  let result = [...mockDB.books];
  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(
      (b) => b.title.toLowerCase().includes(kw) || b.author.toLowerCase().includes(kw)
    );
  }
  if (category && category !== 'All') {
    result = result.filter((b) => b.category === category);
  }
  return result;
};

// 2. Lấy chi tiết sách theo ID
const getBookById = async (id) => {
  if (isMongoConnected() && !(await shouldUseMockDB(Book))) {
    return await Book.findById(id);
  }
  return mockDB.books.find((b) => b._id === id) || null;
};

// 3. Thêm mới sách
const createBook = async (bookData) => {
  const { title, author, isbn, category, publishedYear, totalCopies, availableCopies, description } = bookData;

  const total = totalCopies !== undefined ? Number(totalCopies) : 1;
  const available = availableCopies !== undefined ? Number(availableCopies) : total;

  if (available > total) {
    throw new Error('Số lượng sách khả dụng không được lớn hơn tổng số sách!');
  }

  if (isMongoConnected() && !(await shouldUseMockDB(Book))) {
    if (isbn) {
      const exists = await Book.findOne({ isbn });
      if (exists) throw new Error(`Mã ISBN "${isbn}" đã tồn tại!`);
    }
    return await Book.create({
      title,
      author,
      isbn,
      category: category || 'Chung',
      publishedYear,
      totalCopies: total,
      availableCopies: available,
      description,
    });
  }

  // Dùng Mock DB
  if (isbn && mockDB.books.some((b) => b.isbn === isbn)) {
    throw new Error(`Mã ISBN "${isbn}" đã tồn tại trong thư viện!`);
  }

  const newBook = {
    _id: `bk_${Date.now()}`,
    title,
    author,
    isbn: isbn || `ISBN-${Date.now().toString().slice(-6)}`,
    category: category || 'Chung',
    publishedYear: publishedYear || new Date().getFullYear(),
    totalCopies: total,
    availableCopies: available,
    description: description || '',
    createdAt: new Date(),
  };

  mockDB.books.unshift(newBook);
  return newBook;
};

// 4. Cập nhật thông tin sách
const updateBook = async (id, updateData) => {
  if (isMongoConnected() && !(await shouldUseMockDB(Book))) {
    return await Book.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  const index = mockDB.books.findIndex((b) => b._id === id);
  if (index === -1) return null;

  mockDB.books[index] = {
    ...mockDB.books[index],
    ...updateData,
    updatedAt: new Date(),
  };
  return mockDB.books[index];
};

const adjustAvailableCopies = async (id, adjustment) => {
  if (!Number.isInteger(adjustment) || adjustment === 0) {
    throw new Error('Số lượng điều chỉnh phải là số nguyên khác 0!');
  }

  if (isMongoConnected() && !(await shouldUseMockDB(Book))) {
    const availabilityFilter = adjustment < 0
      ? { availableCopies: { $gte: Math.abs(adjustment) } }
      : { $expr: { $lte: [{ $add: ['$availableCopies', adjustment] }, '$totalCopies'] } };

    return await Book.findOneAndUpdate(
      { _id: id, ...availabilityFilter },
      { $inc: { availableCopies: adjustment } },
      { new: true, runValidators: true }
    );
  }

  const book = mockDB.books.find((item) => item._id === id);
  if (!book) return null;

  const nextAvailable = Number(book.availableCopies || 0) + adjustment;
  if (nextAvailable < 0 || nextAvailable > Number(book.totalCopies || 0)) {
    return null;
  }

  book.availableCopies = nextAvailable;
  book.updatedAt = new Date();
  return book;
};

// 5. Xóa sách
const deleteBook = async (id) => {
  if (isMongoConnected() && !(await shouldUseMockDB(Book))) {
    const book = await Book.findById(id);
    if (!book) return null;
    await Book.findByIdAndDelete(id);
    return true;
  }

  const index = mockDB.books.findIndex((b) => b._id === id);
  if (index === -1) return null;

  mockDB.books.splice(index, 1);
  return true;
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  adjustAvailableCopies,
  deleteBook,
};
