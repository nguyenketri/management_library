// models/book.model.js - collection "books" (Sách)
// Người phụ trách: Người 2
const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tên sách'],
        trim: true,
    },
    author: {
        type: String,
        required: [true, 'Vui lòng nhập tên tác giả'],
        trim: true,
    },
    isbn: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    category: {
        type: String,
        default: 'Chung',
        trim: true,
    },
    publishedYear: { type: Number },
    publisher: { type: String, trim: true },
    pages: { type: Number },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5,
    },
    totalCopies: {
        type: Number,
        default: 1,
        min: [0, 'Số lượng không thể âm'],
    },
    availableCopies: {
        type: Number,
        default: 1,
        min: [0, 'Số lượng khả dụng không thể âm'],
    },
    description: { type: String, trim: true },
}, {
    collection: 'books',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual: số cuốn đang được mượn (không lưu vào CSDL)
bookSchema.virtual('borrowedCopies').get(function () {
    return Math.max(0, (this.totalCopies || 0) - (this.availableCopies || 0));
});

const Book = model('Book', bookSchema);
module.exports = Book;
