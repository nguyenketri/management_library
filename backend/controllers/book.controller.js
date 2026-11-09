const mongoose = require('mongoose');
const Book = require('../models/book.model');

// [GET] /api/books?keyword=...&category=...
exports.getBooks = async (req, resp, next) => {
    try {
        const { keyword, category } = req.query;
        const filter = {};

        if (keyword && keyword.trim() !== '') {
            filter.$or = [
                { title: { $regex: keyword.trim(), $options: 'i' } },
                { author: { $regex: keyword.trim(), $options: 'i' } },
            ];
        }
        if (category && category !== 'All') {
            filter.category = category;
        }

        const books = await Book.find(filter).sort({ createdAt: -1 });
        return resp.status(200).json(books);
    } catch (error) {
        next(error);
    }
};

// [GET] /api/books/:id
exports.getBookById = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid bookId: ${id}` });
        }

        const book = await Book.findById(id);
        if (!book) {
            return resp.status(404).json({ error: `Book with id = ${id} not found` });
        }

        return resp.status(200).json(book);
    } catch (error) {
        next(error);
    }
};

// [POST] /api/books (admin, librarian)
exports.createBook = async (req, resp, next) => {
    try {
        const { title, author, totalCopies, availableCopies } = req.body;

        if (!title || !author) {
            return resp.status(400).json({ error: 'title and author are required' });
        }

        const total = totalCopies !== undefined && totalCopies !== '' ? Number(totalCopies) : 1;
        const available = availableCopies !== undefined && availableCopies !== '' ? Number(availableCopies) : total;

        if (!Number.isInteger(total) || total < 0 || !Number.isInteger(available) || available < 0) {
            return resp.status(400).json({ error: 'totalCopies / availableCopies must be integers >= 0' });
        }
        if (available > total) {
            return resp.status(400).json({ error: 'availableCopies cannot be greater than totalCopies' });
        }

        const book = await Book.create({ ...req.body, totalCopies: total, availableCopies: available });
        return resp.status(201).json(book);
    } catch (error) {
        next(error);
    }
};

// [PUT] /api/books/:id (admin, librarian)
exports.updateBook = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid bookId: ${id}` });
        }

        const book = await Book.findById(id);
        if (!book) {
            return resp.status(404).json({ error: `Book with id = ${id} not found` });
        }

        const { _id, ...data } = req.body;
        Object.assign(book, data);
        if (book.availableCopies > book.totalCopies) {
            return resp.status(400).json({ error: 'availableCopies cannot be greater than totalCopies' });
        }

        await book.save();
        return resp.status(200).json(book);
    } catch (error) {
        next(error);
    }
};

// [DELETE] /api/books/:id (admin, librarian)
exports.deleteBook = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid bookId: ${id}` });
        }

        const deleted = await Book.findByIdAndDelete(id);
        if (!deleted) {
            return resp.status(404).json({ error: `Book with id = ${id} not found` });
        }

        return resp.status(200).json({ message: `Book ${id} deleted successfully` });
    } catch (error) {
        next(error);
    }
};
