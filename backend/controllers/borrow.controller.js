const mongoose = require('mongoose');
const Borrow = require('../models/borrow.model');
const Book = require('../models/book.model');

const today = () => new Date().toISOString().split('T')[0];

// [GET] /api/borrows?status=borrowed|returned|overdue
exports.getBorrows = async (req, resp, next) => {
    try {
        const { status } = req.query;
        const filter = status && status !== 'All' ? { status } : {};

        const borrows = await Borrow.find(filter).sort({ createdAt: -1 });
        return resp.status(200).json(borrows);
    } catch (error) {
        next(error);
    }
};

// [POST] /api/borrows - lập phiếu mượn, trừ 1 cuốn trong kho
exports.borrowBook = async (req, resp, next) => {
    try {
        const { userId, userName, bookId, dueDate, notes } = req.body;

        if (!userId || !bookId) {
            return resp.status(400).json({ error: 'userId and bookId are required' });
        }
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return resp.status(400).json({ error: `Invalid bookId: ${bookId}` });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return resp.status(404).json({ error: `Book with id = ${bookId} not found` });
        }
        if (book.availableCopies <= 0) {
            return resp.status(400).json({ error: `Sách "${book.title}" đã hết, không thể mượn` });
        }

        book.availableCopies -= 1;
        await book.save();

        const borrow = await Borrow.create({
            userId,
            userName,
            bookId,
            bookTitle: book.title,
            borrowDate: today(),
            dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'borrowed',
            notes,
        });

        return resp.status(201).json(borrow);
    } catch (error) {
        next(error);
    }
};

// [PUT] /api/borrows/:id/return - trả sách, cộng lại 1 cuốn vào kho
exports.returnBook = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid borrowId: ${id}` });
        }

        const borrow = await Borrow.findById(id);
        if (!borrow) {
            return resp.status(404).json({ error: `Borrow with id = ${id} not found` });
        }
        if (borrow.status === 'returned') {
            return resp.status(400).json({ error: 'Cuốn sách này đã được trả trước đó' });
        }

        borrow.status = 'returned';
        borrow.returnDate = today();
        await borrow.save();

        const book = mongoose.Types.ObjectId.isValid(borrow.bookId) ? await Book.findById(borrow.bookId) : null;
        if (book) {
            book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
            await book.save();
        }

        return resp.status(200).json(borrow);
    } catch (error) {
        next(error);
    }
};
