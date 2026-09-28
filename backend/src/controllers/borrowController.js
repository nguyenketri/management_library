const borrowService = require('../services/borrowService');

// [GET] /api/borrows - Lấy danh sách phiếu mượn
const getBorrowRecords = async (req, res) => {
  try {
    const { status } = req.query;
    const records = await borrowService.getAllBorrowRecords(status);
    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message,
    });
  }
};

// [POST] /api/borrows - Tạo phiếu mượn sách
const borrowBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID Độc giả và ID Sách!',
      });
    }

    const record = await borrowService.borrowBook(req.body);
    return res.status(201).json({
      success: true,
      message: 'Mượn sách thành công!',
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// [PUT] /api/borrows/:id/return - Trả sách
const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await borrowService.returnBook(id);
    return res.status(200).json({
      success: true,
      message: 'Trả sách thành công!',
      data: record,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBorrowRecords,
  borrowBook,
  returnBook,
};
