const assert = require('node:assert/strict');
const { beforeEach, test } = require('node:test');
const { initialBooks, initialBorrows, mockDB } = require('../mock/mockData');
const borrowService = require('./borrowService');

const today = () => new Date().toISOString().slice(0, 10);
const dateOffset = (offset) => {
  const date = new Date(`${today()}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const resetMockData = () => {
  mockDB.books.splice(0, mockDB.books.length, ...initialBooks.map((book) => ({ ...book })));
  mockDB.borrows.splice(0, mockDB.borrows.length, ...initialBorrows.map((record) => ({ ...record })));
};

beforeEach(resetMockData);

test('reserves available copies atomically when concurrent borrow requests arrive', async () => {
  const book = mockDB.books.find((item) => item._id === 'bk_003');
  book.availableCopies = 1;

  const results = await Promise.allSettled([
    borrowService.borrowBook({ userId: 'usr_003', userName: 'Reader', bookId: book._id }),
    borrowService.borrowBook({ userId: 'usr_004', userName: 'Reader 2', bookId: book._id }),
  ]);

  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(book.availableCopies, 0);
  assert.equal(mockDB.borrows.filter((record) => record.bookId === book._id && record.borrowDate === today()).length, 1);
});

test('allows one renewal only and uses calendar-day calculations', async () => {
  const record = {
    _id: 'test-renewal',
    userId: 'usr_003',
    bookId: 'bk_003',
    bookTitle: 'Test book',
    borrowDate: today(),
    dueDate: today(),
    status: 'borrowed',
    renewalCount: 0,
  };
  mockDB.borrows.unshift(record);

  const renewed = await borrowService.extendBorrow(record._id, record.userId);
  assert.equal(renewed.renewalCount, 1);
  assert.equal(renewed.dueDate, dateOffset(7));
  await assert.rejects(borrowService.extendBorrow(record._id, record.userId));
});

test('returns a borrowed copy once and leaves its record active if inventory cannot be restored', async () => {
  const book = mockDB.books.find((item) => item._id === 'bk_003');
  book.availableCopies = 4;
  const record = {
    _id: 'test-return',
    userId: 'usr_003',
    bookId: book._id,
    bookTitle: book.title,
    dueDate: dateOffset(14),
    status: 'borrowed',
  };
  mockDB.borrows.unshift(record);

  await borrowService.returnBook(record._id);
  assert.equal(record.status, 'returned');
  assert.equal(book.availableCopies, 5);
  await assert.rejects(borrowService.returnBook(record._id));

  const fullStockRecord = { ...record, _id: 'test-return-full-stock', status: 'borrowed', returnDate: null };
  book.availableCopies = book.totalCopies;
  mockDB.borrows.unshift(fullStockRecord);
  await assert.rejects(borrowService.returnBook(fullStockRecord._id));
  assert.equal(fullStockRecord.status, 'borrowed');
  assert.equal(fullStockRecord.returnDate, null);
});

test('does not charge a late fee on the due date and charges by elapsed calendar days', async () => {
  mockDB.borrows.unshift(
    {
      _id: 'test-due-today',
      userId: 'usr_003',
      bookTitle: 'Due today',
      dueDate: today(),
      returnDate: today(),
      status: 'returned',
    },
    {
      _id: 'test-late-two-days',
      userId: 'usr_003',
      bookTitle: 'Late by two days',
      dueDate: dateOffset(-2),
      returnDate: today(),
      status: 'returned',
    }
  );

  const penalties = await borrowService.getMyPenalties('usr_003');
  assert.equal(penalties.items.some((item) => item._id === 'test-due-today'), false);
  assert.equal(penalties.items.find((item) => item._id === 'test-late-two-days').amount, 10000);
});

test('rejects malformed due dates without reserving a copy', async () => {
  const book = mockDB.books.find((item) => item._id === 'bk_003');
  const availableBefore = book.availableCopies;

  await assert.rejects(borrowService.borrowBook({
    userId: 'usr_003',
    userName: 'Reader',
    bookId: book._id,
    dueDate: '2026-02-31',
  }));

  assert.equal(book.availableCopies, availableBefore);
});
