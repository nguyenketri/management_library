// Bộ tính báo cáo phía frontend, dùng khi backend chưa bật (chế độ offline).
// Logic và cấu trúc kết quả giống hệt backend/src/services/reportService.js,
// nên giao diện hiển thị được cả hai nguồn như nhau. Sửa một bên thì sửa cả bên kia.

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const UNKNOWN_CATEGORY = 'Không xác định';
const TOP_LIMIT = 5;

// Ngày hôm nay dạng YYYY-MM-DD (tính theo UTC giống backend)
export const getToday = () => new Date().toISOString().slice(0, 10);

// Hiển thị YYYY-MM-DD thành DD/MM/YYYY
export const formatDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || '-';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

// Kiểm tra chuỗi ngày YYYY-MM-DD có tồn tại thật (loại 2026-02-30, 2026-13-01...)
const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().slice(0, 10) === value;
};

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

// ===== Kiểm tra tham số lọc (cùng thông báo lỗi với backend) =====

const parseDateRange = (query) => {
  const from = normalizeText(query.from);
  const to = normalizeText(query.to);

  if (from && !isValidDate(from)) {
    throw new Error('Ngày bắt đầu (from) không hợp lệ, định dạng đúng là YYYY-MM-DD!');
  }
  if (to && !isValidDate(to)) {
    throw new Error('Ngày kết thúc (to) không hợp lệ, định dạng đúng là YYYY-MM-DD!');
  }
  if (from && to && from > to) {
    throw new Error('Ngày bắt đầu không được sau ngày kết thúc!');
  }

  return { from: from || null, to: to || null };
};

const parseEnum = (value, allowed, message) => {
  if (isAllOrEmpty(value)) return null;
  const text = normalizeText(value);
  if (!allowed.includes(text)) {
    throw new Error(message);
  }
  return text;
};

const parseCategory = (query) => (isAllOrEmpty(query.category) ? null : normalizeText(query.category));

const parseMinDays = (query) => {
  const minDaysText = normalizeText(query.minDays);
  if (!minDaysText) return 1;
  if (!/^\d+$/.test(minDaysText) || Number(minDaysText) < 1) {
    throw new Error('Số ngày quá hạn tối thiểu (minDays) phải là số nguyên lớn hơn hoặc bằng 1!');
  }
  return Number(minDaysText);
};

const PARSERS = {
  dashboard: (query) => parseDateRange(query),
  books: (query) => ({
    availability: parseEnum(
      query.availability,
      ['available', 'out', 'borrowed'],
      'Tình trạng sách (availability) chỉ nhận: available, out, borrowed!'
    ),
    keyword: normalizeText(query.keyword),
    category: parseCategory(query),
  }),
  readers: (query) => ({
    ...parseDateRange(query),
    hasActiveLoan: parseEnum(
      query.hasActiveLoan,
      ['true', 'false'],
      'Bộ lọc đang mượn (hasActiveLoan) chỉ nhận: true, false!'
    ),
    keyword: normalizeText(query.keyword),
  }),
  borrows: (query) => ({
    ...parseDateRange(query),
    status: parseEnum(
      query.status,
      ['borrowed', 'returned', 'overdue'],
      'Trạng thái (status) chỉ nhận: borrowed, returned, overdue!'
    ),
    groupBy: parseEnum(query.groupBy, ['day', 'month'], 'Kiểu nhóm (groupBy) chỉ nhận: day, month!') || 'month',
    category: parseCategory(query),
  }),
  overdue: (query) => ({
    minDays: parseMinDays(query),
    keyword: normalizeText(query.keyword),
    category: parseCategory(query),
  }),
};

// ===== Chuẩn hoá dữ liệu =====

const getEffectiveStatus = (record, today) => {
  if (record.status === 'returned') return 'returned';
  if (isValidDate(record.dueDate) && record.dueDate < today) return 'overdue';
  return 'borrowed';
};

const getOverdueDays = (record, today) => {
  if (getEffectiveStatus(record, today) !== 'overdue') return 0;
  return daysBetween(record.dueDate, today);
};

const toSafeUser = (user) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  studentId: user.studentId || '',
});

const prepareData = ({ books = [], users = [], borrows = [] }) => ({
  books,
  users,
  borrows,
  bookMap: new Map(books.map((book) => [String(book._id), book])),
  userMap: new Map(users.map((user) => [String(user._id), user])),
  today: getToday(),
});

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

// ===== Các báo cáo =====

const buildDashboard = ({ from, to }, data) => {
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

const buildBookReport = ({ availability, keyword, category }, data) => {
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

const buildReaderReport = ({ from, to, hasActiveLoan, keyword }, data) => {
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

const buildBorrowReport = ({ from, to, status, groupBy, category }, data) => {
  const { borrows, today } = data;

  let records = borrows;
  if (category) records = records.filter((r) => getRecordCategory(r, data.bookMap) === category);
  if (status) records = records.filter((r) => getEffectiveStatus(r, today) === status);

  const borrowedInPeriod = records.filter((r) => isInRange(r.borrowDate, from, to));
  const returnedInPeriod = records.filter(
    (r) => r.status === 'returned' && isInRange(r.returnDate, from, to)
  );

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

const buildOverdueReport = ({ minDays, keyword, category }, data) => {
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

const BUILDERS = {
  dashboard: buildDashboard,
  books: buildBookReport,
  readers: buildReaderReport,
  borrows: buildBorrowReport,
  overdue: buildOverdueReport,
};

export const REPORT_TYPES = Object.keys(BUILDERS);

// Kiểm tra bộ lọc trước khi gọi API (ném lỗi với thông báo tiếng Việt nếu sai)
export const validateReportQuery = (type, query = {}) => PARSERS[type](query);

// Tính báo cáo từ dữ liệu local: source = { books, users, borrows }
export const buildReport = (type, query = {}, source = {}) => {
  const params = PARSERS[type](query);
  return BUILDERS[type](params, prepareData(source));
};
