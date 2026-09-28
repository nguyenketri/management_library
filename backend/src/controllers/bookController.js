const bookService = require('../services/bookService');

// [GET] /api/books - Lấy danh sách sách
const getBooks = async (req, res) => {
  try {
    const books = await bookService.getAllBooks(req.query);
    return res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// [GET] /api/books/:id - Xem chi tiết một cuốn sách
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await bookService.getBookById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách với ID: ' + id
      });
    }

    return res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
};

// [POST] /api/books - Thêm mới một cuốn sách
const createBook = async (req, res) => {
  try {
    const { title, author } = req.body;

    // Validate dữ liệu đầu vào cơ bản
    if (!title || !author) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ Tên sách và Tác giả!'
      });
    }

    const newBook = await bookService.createBook(req.body);
    return res.status(201).json({
      success: true,
      message: 'Thêm sách mới thành công!',
      data: newBook
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// [PUT] /api/books/:id - Cập nhật sách
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBook = await bookService.updateBook(id, req.body);

    if (!updatedBook) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách để cập nhật!'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật sách thành công!',
      data: updatedBook
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// [DELETE] /api/books/:id - Xóa sách
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await bookService.deleteBook(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách để xóa!'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa sách thành công!'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
