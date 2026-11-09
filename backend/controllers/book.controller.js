// controllers/book.controller.js - Quản lý sách
// Người phụ trách: Người 2
const mongoose = require('mongoose');
const Book = require('../models/book.model');
const Category = require('../models/category.model');

// [GET] /api/books?keyword=...&category=...&page=...&limit=...
exports.getBooks = async (req, resp, next) => {
    try {
        const { keyword, category, page, limit } = req.query;
        const filter = {};

        if (keyword && keyword.trim() !== '') {
            const regex = { $regex: keyword.trim(), $options: 'i' };
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
            const pageNum = Math.max(1, parseInt(page, 10) || 1);
            const pageSize = Math.max(1, parseInt(limit, 10) || 12);
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
        const { title, author, category, totalCopies, availableCopies } = req.body;

        if (!title || !title.trim()) {
            return resp.status(400).json({ error: 'Vui lòng nhập tên sách' });
        }
        if (!author || !author.trim()) {
            return resp.status(400).json({ error: 'Vui lòng nhập tên tác giả' });
        }

        // Kiểm tra danh mục có tồn tại trong hệ thống không
        if (category && category.trim() !== '') {
            const categoryExists = await Category.findOne({
                name: { $regex: `^${category.trim()}$`, $options: 'i' },
            });
            if (!categoryExists) {
                return resp.status(400).json({ error: `Danh mục "${category}" không tồn tại trong hệ thống` });
            }
        }

        const total = totalCopies !== undefined && totalCopies !== '' ? Number(totalCopies) : 1;
        const available = availableCopies !== undefined && availableCopies !== '' ? Number(availableCopies) : total;

        if (!Number.isInteger(total) || total < 0 || !Number.isInteger(available) || available < 0) {
            return resp.status(400).json({ error: 'Số lượng sách phải là số nguyên >= 0' });
        }
        if (available > total) {
            return resp.status(400).json({ error: 'Số lượng khả dụng không được lớn hơn tổng số lượng' });
        }

        const book = await Book.create({
            ...req.body,
            title: title.trim(),
            author: author.trim(),
            category: category?.trim() || 'Chung',
            totalCopies: total,
            availableCopies: available,
        });

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

        const { _id, ...data } = req.body;

        // Nếu cập nhật danh mục, kiểm tra danh mục có tồn tại không
        if (data.category && data.category.trim() !== '') {
            const categoryExists = await Category.findOne({
                name: { $regex: `^${data.category.trim()}$`, $options: 'i' },
            });
            if (!categoryExists) {
                return resp.status(400).json({ error: `Danh mục "${data.category}" không tồn tại trong hệ thống` });
            }
            data.category = categoryExists.name; // Chuẩn hóa hoa thường theo tên danh mục trong DB
        }

        Object.assign(book, data);

        if (book.availableCopies > book.totalCopies) {
            return resp.status(400).json({ error: 'Số lượng khả dụng không được lớn hơn tổng số lượng' });
        }

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

        const deleted = await Book.findByIdAndDelete(id);
        if (!deleted) {
            return resp.status(404).json({ error: `Book with id = ${id} not found` });
        }

        return resp.status(200).json({ message: `Đã xóa sách "${deleted.title}" thành công` });
    } catch (error) {
        next(error);
    }
};
