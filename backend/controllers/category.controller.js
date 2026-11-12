// Người phụ trách: Người 2
const mongoose = require('mongoose');
const Category = require('../models/category.model');
const Book = require('../models/book.model');
const { bodyObject, text, escapeRegex } = require('../utils/validation');

// [GET] /api/categories - Lấy danh sách danh mục kèm số lượng sách
exports.getCategories = async (req, resp, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        // Đếm số lượng đầu sách thuộc từng danh mục
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const bookCount = await Book.countDocuments({ category: cat.name });
                const catObj = cat.toObject();
                return {
                    ...catObj,
                    bookCount,
                };
            })
        );

        return resp.status(200).json(categoriesWithCount);
    } catch (error) {
        next(error);
    }
};

// [POST] /api/categories - Thêm danh mục mới (thủ thư)
exports.createCategory = async (req, resp, next) => {
    try {
        const body = bodyObject(req.body);
        const name = body.name === undefined && req.params.id ? undefined : text(body.name, 'Tên danh mục', 100, true);
        const description = body.description === undefined ? undefined : text(body.description, 'Mô tả', 2000);

        if (!name || name.trim() === '') {
            return resp.status(400).json({ error: 'Vui lòng nhập tên danh mục' });
        }

        const trimmedName = name.trim();
        const existing = await Category.findOne({ name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: 'i' } });
        if (existing) {
            return resp.status(400).json({ error: `Danh mục "${trimmedName}" đã tồn tại` });
        }

        const category = await Category.create({
            name: trimmedName,
            description: description?.trim() || '',
        });

        return resp.status(201).json({
            ...category.toObject(),
            bookCount: 0,
        });
    } catch (error) {
        next(error);
    }
};

// [PUT] /api/categories/:id - Sửa danh mục (thủ thư)
exports.updateCategory = async (req, resp, next) => {
    try {
        const { id } = req.params;
        const body = bodyObject(req.body);
        const name = body.name === undefined && req.params.id ? undefined : text(body.name, 'Tên danh mục', 100, true);
        const description = body.description === undefined ? undefined : text(body.description, 'Mô tả', 2000);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid categoryId: ${id}` });
        }

        const category = await Category.findById(id);
        if (!category) {
            return resp.status(404).json({ error: `Không tìm thấy danh mục với id = ${id}` });
        }

        const oldName = category.name;
        if (name && name.trim() !== '') {
            const trimmedName = name.trim();
            // Nếu đổi tên, kiểm tra tên mới có bị trùng không
            if (trimmedName.toLowerCase() !== oldName.toLowerCase()) {
                const duplicate = await Category.findOne({
                    _id: { $ne: id },
                    name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: 'i' },
                });
                if (duplicate) {
                    return resp.status(400).json({ error: `Danh mục "${trimmedName}" đã tồn tại` });
                }
            }
            category.name = trimmedName;

            // Đồng bộ tên danh mục mới sang các cuốn sách cũ
            if (trimmedName !== oldName) {
                await Book.updateMany({ category: oldName }, { category: trimmedName });
            }
        }

        if (description !== undefined) {
            category.description = description.trim();
        }

        await category.save();

        const bookCount = await Book.countDocuments({ category: category.name });
        return resp.status(200).json({
            ...category.toObject(),
            bookCount,
        });
    } catch (error) {
        next(error);
    }
};

// [DELETE] /api/categories/:id - Xóa danh mục (không xóa khi còn sách)
exports.deleteCategory = async (req, resp, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid categoryId: ${id}` });
        }

        const category = await Category.findById(id);
        if (!category) {
            return resp.status(404).json({ error: `Không tìm thấy danh mục với id = ${id}` });
        }

        // Kiểm tra xem còn sách nào thuộc danh mục này không
        const bookCount = await Book.countDocuments({ category: category.name });
        if (bookCount > 0) {
            return resp.status(400).json({
                error: `Không thể xóa danh mục "${category.name}" vì vẫn còn ${bookCount} cuốn sách thuộc danh mục này.`,
            });
        }

        await Category.findByIdAndDelete(id);
        return resp.status(200).json({ message: `Đã xóa danh mục "${category.name}" thành công` });
    } catch (error) {
        next(error);
    }
};
