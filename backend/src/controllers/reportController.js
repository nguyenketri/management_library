const reportService = require('../services/reportService');

// Gửi lỗi: lỗi tham số (statusCode 400) hoặc lỗi server (500)
const sendError = (res, error) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Lỗi server: ' + error.message : error.message,
  });
};

// Tạo handler chung: gọi hàm báo cáo với query string và trả về kết quả
const createReportHandler = (reportFn) => async (req, res) => {
  try {
    const data = await reportFn(req.query);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// [GET] /api/reports/dashboard - Tổng quan hoạt động thư viện
const getDashboard = createReportHandler(reportService.getDashboard);

// [GET] /api/reports/books - Báo cáo sách
const getBookReport = createReportHandler(reportService.getBookReport);

// [GET] /api/reports/readers - Báo cáo bạn đọc
const getReaderReport = createReportHandler(reportService.getReaderReport);

// [GET] /api/reports/borrows - Báo cáo mượn/trả
const getBorrowReport = createReportHandler(reportService.getBorrowReport);

// [GET] /api/reports/overdue - Báo cáo quá hạn
const getOverdueReport = createReportHandler(reportService.getOverdueReport);

module.exports = {
  getDashboard,
  getBookReport,
  getReaderReport,
  getBorrowReport,
  getOverdueReport,
};
