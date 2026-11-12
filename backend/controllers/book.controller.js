// controllers/book.controller.js - Quản lý sách
// Người phụ trách: Người 2
const mongoose = require('mongoose');
const Book = require('../models/book.model');
const Category = require('../models/category.model');
const Borrow = require('../models/borrow.model');
const { bookData, text, integer, escapeRegex, badRequest } = require('../utils/validation');

// [GET] /api/books?keyword=...&category=...&page=...&limit=...
exports.getBooks = async (req, resp, next) => {
    try {
        const { page, limit } = req.query;
        const keyword = req.query.keyword === undefined ? '' : text(req.query.keyword, 'Từ khóa', 200);
        const category = req.query.category === undefined ? '' : text(req.query.category, 'Danh mục', 100);
        const filter = {};

        if (keyword && keyword.trim() !== '') {
            const regex = { $regex: escapeRegex(keyword.trim()), $options: 'i' };
            filter.$or = [
                { title: regex },
                { author: regex },
                { isbn: regex },
            ];
        }

        if (category && category !== 'all' && category !== 'All') {
            filter.category = category;
        }

        // Nếu có truyền param phân trang (page hoặc limit)
        if (page !== undefined || limit !== undefined) {
            const pageNum = page === undefined ? 1 : integer(page, 'Trang', 1, 1000000);
            const pageSize = limit === undefined ? 12 : integer(limit, 'Số sách mỗi trang', 1, 100);
            const skip = (pageNum - 1) * pageSize;

            const [total, books] = await Promise.all([
                Book.countDocuments(filter),
                Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
            ]);

            return resp.status(200).json({
                books,
                total,
                page: pageNum,
                totalPages: Math.ceil(total / pageSize) || 1,
                limit: pageSize,
            });
        }

        // Mặc định không truyền page -> trả về mảng đầy đủ
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

// [POST] /api/books (chỉ thủ thư)
exports.createBook = async (req, resp, next) => {
    try {
        const data = bookData(req.body, true);
        const category = await Category.findOne({ name: { $regex: '^' + escapeRegex(data.category) + '$', $options: 'i' } });
        if (!category) badRequest('Danh mục không tồn tại trong hệ thống');
        data.category = category.name;
        if (data.availableCopies > data.totalCopies) badRequest('Số lượng khả dụng không được lớn hơn tổng số lượng');
        const book = await Book.create(data);

        return resp.status(201).json(book);
    } catch (error) {
        next(error);
    }
};

// [PUT] /api/books/:id (chỉ thủ thư)
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

        const data = bookData(req.body);
        if (data.category !== undefined) {
            const category = await Category.findOne({ name: { $regex: '^' + escapeRegex(data.category) + '$', $options: 'i' } });
            if (!category) badRequest('Danh mục không tồn tại trong hệ thống');
            data.category = category.name;
        }
        const total = data.totalCopies ?? book.totalCopies;
        const available = data.availableCopies ?? book.availableCopies;
        if (available > total) badRequest('Số lượng khả dụng không được lớn hơn tổng số lượng');
        if (data.totalCopies !== undefined || data.availableCopies !== undefined) {
            const activeLoans = await Borrow.countDocuments({ bookId: id, status: { $in: ['borrowed', 'overdue'] } });
            if (total - available !== activeLoans) badRequest('Số lượng phải khớp với số bản đang cho mượn');
        }
        Object.assign(book, data);

        await book.save();
        return resp.status(200).json(book);
    } catch (error) {
        next(error);
    }
};

// [DELETE] /api/books/:id (chỉ thủ thư)
exports.deleteBook = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid bookId: ${id}` });
        }

        if (await Borrow.exists({ bookId: id, status: { $in: ['pending', 'borrowed', 'overdue'] } })) {
            badRequest('Không thể xóa sách có yêu cầu chờ duyệt hoặc đang cho mượn');
        }
        const deleted = await Book.findByIdAndDelete(id);
        if (!deleted) {
            return resp.status(404).json({ error: `Book with id = ${id} not found` });
        }

        return resp.status(200).json({ message: `Đã xóa sách "${deleted.title}" thành công` });
    } catch (error) {
        next(error);
    }
};
