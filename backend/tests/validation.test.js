const { test } = require('node:test');
const assert = require('node:assert/strict');
const { text, integer, escapeRegex, bookData } = require('../utils/validation');
const books = require('../controllers/book.controller');
const categories = require('../controllers/category.controller');
const reviews = require('../controllers/review.controller');

test('reject malformed values instead of coercing arrays, booleans and objects', () => {
    for (const v of [null, 12, {}, []]) assert.throws(() => text(v, 'Tên', 100, true), { statusCode: 400 });
    for (const v of ['', ' ', '2abc', true, [], {}, null, 1.5, -1, Infinity]) assert.throws(() => integer(v, 'Số lượng', 0), { statusCode: 400 });
    assert.equal(integer('12', 'Số lượng', 0), 12);
    assert.throws(() => integer(101, 'Limit', 1, 100), { statusCode: 400 });
});
test('category and search regex treat metacharacters literally', () => {
    for (const value of ['C++', '(IT)', '.*', '[Books]']) {
        const regex = new RegExp('^' + escapeRegex(value) + '$', 'i');
        assert.ok(regex.test(value));
        assert.ok(!regex.test('unrelated'));
    }
});
test('book input only accepts editable fields and valid metadata', () => {
    const data = bookData({ title: ' Book ', author: ' Author ', category: ' IT ', rating: 1, createdAt: 'fake' }, true);
    assert.equal(data.title, 'Book');
    assert.equal(data.rating, undefined);
    assert.equal(data.createdAt, undefined);
    assert.equal(data.availableCopies, 1);
    for (const extra of [{ pages: 0 }, { totalCopies: 1.5 }, { category: '' }, { publishedYear: new Date().getFullYear() + 1 }]) {
        assert.throws(() => bookData({ title: 'Book', author: 'Author', category: 'IT', ...extra }, true), { statusCode: 400 });
    }
});
test('controllers return validation errors before accessing database', async () => {
    for (const [handler, req] of [
        [books.createBook, { body: { title: 123 }, params: {} }],
        [books.getBooks, { query: { keyword: {} } }],
        [books.getBooks, { query: { page: '2abc' } }],
        [categories.createCategory, { body: { name: {} }, params: {} }],
        [categories.updateCategory, { body: { name: '  ' }, params: { id: '123' } }],
        [reviews.createReview, { body: { bookId: '507f1f77bcf86cd799439011', rating: 3.7, comment: 'Good' }, user: { id: '123' } }],
    ]) {
        let error;
        await handler(req, {}, e => { error = e; });
        assert.equal(error?.statusCode, 400);
    }
});
