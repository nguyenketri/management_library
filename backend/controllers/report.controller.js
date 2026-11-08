const Book = require('../models/book.model');
const User = require('../models/user.model');
const Borrow = require('../models/borrow.model');

// Controller báo cáo cho Quản lý thư viện (chỉ đọc dữ liệu, không thay đổi gì).
// Phần 1: hàm tính toán  ·  Phần 2: các handler (req, resp, next) ở cuối file

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const UNKNOWN_CATEGORY = 'Không xác định';
const TOP_LIMIT = 5;

// Ngày hôm nay dạng YYYY-MM-DD (cùng cách tính với phiếu mượn)
const getToday = () => new Date().toISOString().slice(0, 10);

// Lỗi tham số không hợp lệ -> controller trả về 400
const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

// Kiểm tra chuỗi ngày YYYY-MM-DD có tồn tại thật (loại 2026-02-30, 2026-13-01...)
const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === value;
};

// Số ngày từ startDate đến endDate (cả hai đều YYYY-MM-DD hợp lệ)
const daysBetween = (startDate, endDate) => {
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / DAY_IN_MS);
};

// Ngày nằm trong khoảng [from, to] (tính cả hai đầu, thiếu đầu nào thì bỏ qua đầu đó)
const isInRange = (date, from, to) => {
  if (!isValidDate(date)) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
};

const normalizeText = (value) => (value === undefined || value === null ? '' : String(value).trim());
const containsKeyword = (fields, keyword) => {
  const kw = keyword.toLowerCase();
  return fields.some((field) => normalizeText(field).toLowerCase().includes(kw));
};

const isAllOrEmpty = (value) => !normalizeText(value) || normalizeText(value) === 'All';

// ===== Kiểm tra tham số lọc =====

const parseDateRange = (query) => {
  const from = normalizeText(query.from);
  const to = normalizeText(query.to);

  if (from && !isValidDate(from)) {
    throw badRequest('Ngày bắt đầu (from) không hợp lệ, định dạng đúng là YYYY-MM-DD!');
  }
  if (to && !isValidDate(to)) {
    throw badRequest('Ngày kết thúc (to) không hợp lệ, định dạng đúng là YYYY-MM-DD!');
  }
  if (from && to && from > to) {
    throw badRequest('Ngày bắt đầu không được sau ngày kết thúc!');
  }

  return { from: from || null, to: to || null };
};

const parseEnum = (value, allowed, message) => {
  if (isAllOrEmpty(value)) return null;
  const text = normalizeText(value);
  if (!allowed.includes(text)) {
    throw badRequest(message);
  }
  return text;
};

// ===== Chuẩn hoá dữ liệu =====

// Trạng thái thực tế của phiếu: quá hạn khi chưa trả và hạn trả trước hôm nay
const getEffectiveStatus = (record, today) => {
  if (record.status === 'returned') return 'returned';
  if (isValidDate(record.dueDate) && record.dueDate < today) return 'overdue';
  return 'borrowed';
};

const getOverdueDays = (record, today) => {
  if (getEffectiveStatus(record, today) !== 'overdue') return 0;
  return daysBetween(record.dueDate, today);
};

// Chỉ lấy các trường cần thiết của người dùng (không bao giờ trả về password)
const toSafeUser = (user) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  studentId: user.studentId || '',
});

const loadData = async () => {
  const [books, users, borrows] = await Promise.all([
    Book.find().lean(),
    User.find().select('-password').lean(),
    Borrow.find().sort({ createdAt: -1 }).lean(),
  ]);

  const bookMap = new Map(books.map((book) => [String(book._id), book]));
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  return { books, users, borrows, bookMap, userMap, today: getToday() };
};

const getRecordCategory = (record, bookMap) => {
  const book = bookMap.get(String(record.bookId));
  return book ? book.category || UNKNOWN_CATEGORY : UNKNOWN_CATEGORY;
};

const toBorrowItem = (record, data) => ({
  _id: String(record._id),
  userId: String(record.userId),
  userName: record.userName,
  bookId: String(record.bookId),
  bookTitle: record.bookTitle,
  category: getRecordCategory(record, data.bookMap),
  borrowDate: record.borrowDate,
  dueDate: record.dueDate,
  returnDate: record.returnDate || null,
  status: getEffectiveStatus(record, data.today),
  overdueDays: getOverdueDays(record, data.today),
});

const getBorrowedCopies = (book) => Math.max(0, (book.totalCopies || 0) - (book.availableCopies || 0));

// Top sách được mượn nhiều nhất từ danh sách phiếu
const getTopBooks = (records) => {
  const counter = new Map();
  records.forEach((record) => {
    const key = String(record.bookId);
    const current = counter.get(key) || { bookId: key, bookTitle: record.bookTitle, count: 0 };
    current.count += 1;
    counter.set(key, current);
  });
  return [...counter.values()].sort((a, b) => b.count - a.count).slice(0, TOP_LIMIT);
};

const sortByOverdueDesc = (a, b) => b.overdueDays - a.overdueDays;

// ===== 1. Dashboard tổng quan =====
const buildDashboard = async (query = {}) => {
  const { from, to } = parseDateRange(query);
  const data = await loadData();
  const { books, users, borrows, today } = data;

  const readers = users.filter((u) => u.role === 'member');
  const activeRecords = borrows.filter((r) => getEffectiveStatus(r, today) !== 'returned');
  const overdueItems = borrows
    .filter((r) => getEffectiveStatus(r, today) === 'overdue')
    .map((r) => toBorrowItem(r, data))
    .sort(sortByOverdueDesc);
  const borrowedInPeriod = borrows.filter((r) => isInRange(r.borrowDate, from, to));
  const returnedInPeriod = borrows.filter(
    (r) => r.status === 'returned' && isInRange(r.returnDate, from, to)
  );
  const readersWithLoans = new Set(activeRecords.map((r) => String(r.userId)));

  return {
    today,
    period: { from, to },
    books: {
      titles: books.length,
      totalCopies: books.reduce((sum, b) => sum + (b.totalCopies || 0), 0),
      availableCopies: books.reduce((sum, b) => sum + (b.availableCopies || 0), 0),
      borrowedCopies: books.reduce((sum, b) => sum + getBorrowedCopies(b), 0),
      outOfStockTitles: books.filter((b) => (b.availableCopies || 0) <= 0).length,
    },
    readers: {
      total: readers.length,
      withActiveLoans: readers.filter((u) => readersWithLoans.has(String(u._id))).length,
    },
    borrows: {
      borrowedInPeriod: borrowedInPeriod.length,
      returnedInPeriod: returnedInPeriod.length,
      active: activeRecords.length,
      overdue: overdueItems.length,
    },
    topBooks: getTopBooks(borrowedInPeriod),
    topOverdue: overdueItems.slice(0, TOP_LIMIT),
  };
};

// ===== 2. Báo cáo sách =====
const buildBookReport = async (query = {}) => {
  const availability = parseEnum(
    query.availability,
    ['available', 'out', 'borrowed'],
    'Tình trạng sách (availability) chỉ nhận: available, out, borrowed!'
  );
  const keyword = normalizeText(query.keyword);
  const category = isAllOrEmpty(query.category) ? null : normalizeText(query.category);

  const data = await loadData();
  const { books, borrows, today } = data;

  let items = books.map((book) => {
    const bookId = String(book._id);
    const records = borrows.filter((r) => String(r.bookId) === bookId);
    return {
      _id: bookId,
      title: book.title,
      author: book.author,
      category: book.category || UNKNOWN_CATEGORY,
      totalCopies: book.totalCopies || 0,
      availableCopies: book.availableCopies || 0,
      borrowedCopies: getBorrowedCopies(book),
      activeLoans: records.filter((r) => getEffectiveStatus(r, today) !== 'returned').length,
      timesBorrowed: records.length,
    };
  });

  if (category) items = items.filter((b) => b.category === category);
  if (keyword) items = items.filter((b) => containsKeyword([b.title, b.author], keyword));
  if (availability === 'available') items = items.filter((b) => b.availableCopies > 0);
  if (availability === 'out') items = items.filter((b) => b.availableCopies <= 0);
  if (availability === 'borrowed') items = items.filter((b) => b.borrowedCopies > 0);

  const categoryMap = new Map();
  items.forEach((b) => {
    const current = categoryMap.get(b.category) || {
      category: b.category,
      titles: 0,
      totalCopies: 0,
      availableCopies: 0,
      borrowedCopies: 0,
    };
    current.titles += 1;
    current.totalCopies += b.totalCopies;
    current.availableCopies += b.availableCopies;
    current.borrowedCopies += b.borrowedCopies;
    categoryMap.set(b.category, current);
  });

  return {
    summary: {
      titles: items.length,
      totalCopies: items.reduce((sum, b) => sum + b.totalCopies, 0),
      availableCopies: items.reduce((sum, b) => sum + b.availableCopies, 0),
      borrowedCopies: items.reduce((sum, b) => sum + b.borrowedCopies, 0),
      outOfStockTitles: items.filter((b) => b.availableCopies <= 0).length,
    },
    byCategory: [...categoryMap.values()].sort((a, b) => b.titles - a.titles),
    items,
  };
};

// ===== 3. Báo cáo bạn đọc =====
const buildReaderReport = async (query = {}) => {
  const { from, to } = parseDateRange(query);
  const hasActiveLoan = parseEnum(
    query.hasActiveLoan,
    ['true', 'false'],
    'Bộ lọc đang mượn (hasActiveLoan) chỉ nhận: true, false!'
  );
  const keyword = normalizeText(query.keyword);

  const data = await loadData();
  const { users, borrows, today } = data;

  let items = users
    .filter((u) => u.role === 'member')
    .map((user) => {
      const safeUser = toSafeUser(user);
      const records = borrows.filter((r) => String(r.userId) === safeUser._id);
      const borrowDates = records.map((r) => r.borrowDate).filter(isValidDate).sort();
      return {
        ...safeUser,
        borrowsInPeriod: records.filter((r) => isInRange(r.borrowDate, from, to)).length,
        activeLoans: records.filter((r) => getEffectiveStatus(r, today) !== 'returned').length,
        overdueLoans: records.filter((r) => getEffectiveStatus(r, today) === 'overdue').length,
        lastBorrowDate: borrowDates.length ? borrowDates[borrowDates.length - 1] : null,
      };
    });

  if (keyword) items = items.filter((u) => containsKeyword([u.name, u.email, u.studentId], keyword));
  if (hasActiveLoan === 'true') items = items.filter((u) => u.activeLoans > 0);
  if (hasActiveLoan === 'false') items = items.filter((u) => u.activeLoans === 0);

  return {
    period: { from, to },
    summary: {
      total: items.length,
      withActiveLoans: items.filter((u) => u.activeLoans > 0).length,
      withOverdue: items.filter((u) => u.overdueLoans > 0).length,
    },
    topReaders: items
      .filter((u) => u.borrowsInPeriod > 0)
      .sort((a, b) => b.borrowsInPeriod - a.borrowsInPeriod)
      .slice(0, TOP_LIMIT),
    items,
  };
};

// ===== 4. Báo cáo mượn/trả =====
const buildBorrowReport = async (query = {}) => {
  const { from, to } = parseDateRange(query);
  const status = parseEnum(
    query.status,
    ['borrowed', 'returned', 'overdue'],
    'Trạng thái (status) chỉ nhận: borrowed, returned, overdue!'
  );
  const groupBy = parseEnum(query.groupBy, ['day', 'month'], 'Kiểu nhóm (groupBy) chỉ nhận: day, month!') || 'month';
  const category = isAllOrEmpty(query.category) ? null : normalizeText(query.category);

  const data = await loadData();
  const { borrows, today } = data;

  let records = borrows;
  if (category) records = records.filter((r) => getRecordCategory(r, data.bookMap) === category);
  if (status) records = records.filter((r) => getEffectiveStatus(r, today) === status);

  const borrowedInPeriod = records.filter((r) => isInRange(r.borrowDate, from, to));
  const returnedInPeriod = records.filter(
    (r) => r.status === 'returned' && isInRange(r.returnDate, from, to)
  );

  // Thống kê theo thời gian: mượn theo borrowDate, trả theo returnDate
  const toPeriod = (date) => (groupBy === 'day' ? date : date.slice(0, 7));
  const timelineMap = new Map();
  const addToTimeline = (date, field) => {
    const period = toPeriod(date);
    const current = timelineMap.get(period) || { period, borrowed: 0, returned: 0 };
    current[field] += 1;
    timelineMap.set(period, current);
  };
  borrowedInPeriod.forEach((r) => addToTimeline(r.borrowDate, 'borrowed'));
  returnedInPeriod.forEach((r) => addToTimeline(r.returnDate, 'returned'));

  const categoryMap = new Map();
  borrowedInPeriod.forEach((r) => {
    const name = getRecordCategory(r, data.bookMap);
    categoryMap.set(name, (categoryMap.get(name) || 0) + 1);
  });

  // Danh sách phiếu có phát sinh mượn hoặc trả trong kỳ
  const items = records
    .filter((r) => isInRange(r.borrowDate, from, to) || (r.status === 'returned' && isInRange(r.returnDate, from, to)))
    .map((r) => toBorrowItem(r, data))
    .sort((a, b) => (a.borrowDate < b.borrowDate ? 1 : a.borrowDate > b.borrowDate ? -1 : 0));

  return {
    period: { from, to },
    groupBy,
    summary: {
      borrowed: borrowedInPeriod.length,
      returned: returnedInPeriod.length,
      returnedLate: returnedInPeriod.filter((r) => isValidDate(r.dueDate) && r.returnDate > r.dueDate).length,
      active: records.filter((r) => getEffectiveStatus(r, today) !== 'returned').length,
      overdue: records.filter((r) => getEffectiveStatus(r, today) === 'overdue').length,
    },
    timeline: [...timelineMap.values()].sort((a, b) => (a.period < b.period ? -1 : 1)),
    topBooks: getTopBooks(borrowedInPeriod),
    byCategory: [...categoryMap.entries()]
      .map(([name, count]) => ({ category: name, count }))
      .sort((a, b) => b.count - a.count),
    items,
  };
};

// ===== 5. Báo cáo quá hạn =====
const buildOverdueReport = async (query = {}) => {
  let minDays = 1;
  const minDaysText = normalizeText(query.minDays);
  if (minDaysText) {
    if (!/^\d+$/.test(minDaysText) || Number(minDaysText) < 1) {
      throw badRequest('Số ngày quá hạn tối thiểu (minDays) phải là số nguyên lớn hơn hoặc bằng 1!');
    }
    minDays = Number(minDaysText);
  }
  const keyword = normalizeText(query.keyword);
  const category = isAllOrEmpty(query.category) ? null : normalizeText(query.category);

  const data = await loadData();
  const { borrows, userMap, today } = data;

  let items = borrows
    .filter((r) => getEffectiveStatus(r, today) === 'overdue')
    .map((r) => {
      const user = userMap.get(String(r.userId));
      return {
        ...toBorrowItem(r, data),
        userEmail: user ? user.email : '',
        userPhone: user ? user.phone || '' : '',
      };
    })
    .filter((item) => item.overdueDays >= minDays);

  if (category) items = items.filter((item) => item.category === category);
  if (keyword) items = items.filter((item) => containsKeyword([item.userName, item.bookTitle], keyword));
  items.sort(sortByOverdueDesc);

  const totalDays = items.reduce((sum, item) => sum + item.overdueDays, 0);

  return {
    today,
    summary: {
      count: items.length,
      readersAffected: new Set(items.map((item) => item.userId)).size,
      maxDays: items.length ? items[0].overdueDays : 0,
      avgDays: items.length ? Math.round((totalDays / items.length) * 10) / 10 : 0,
    },
    items,
  };
};

// ===== Handler =====
// Lỗi tham số (statusCode = 400) được next(error) chuyển cho error.middleware -> { error }

// [GET] /api/reports/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD
exports.getDashboard = async (req, resp, next) => {
    try {
        const data = await buildDashboard(req.query);
        return resp.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// [GET] /api/reports/books?category=...&keyword=...&availability=...
exports.getBookReport = async (req, resp, next) => {
    try {
        const data = await buildBookReport(req.query);
        return resp.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// [GET] /api/reports/readers?from=...&to=...&keyword=...&hasActiveLoan=...
exports.getReaderReport = async (req, resp, next) => {
    try {
        const data = await buildReaderReport(req.query);
        return resp.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// [GET] /api/reports/borrows?from=...&to=...&category=...&status=...&groupBy=day|month
exports.getBorrowReport = async (req, resp, next) => {
    try {
        const data = await buildBorrowReport(req.query);
        return resp.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

// [GET] /api/reports/overdue?category=...&keyword=...&minDays=1
exports.getOverdueReport = async (req, resp, next) => {
    try {
        const data = await buildOverdueReport(req.query);
        return resp.status(200).json(data);
    } catch (error) {
        next(error);
    }
};
