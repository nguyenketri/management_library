// Người phụ trách: Người 2
// const mongoose = require('mongoose');
// const Category = require('../models/category.model');

// [GET] /api/categories - Lấy danh sách danh mục
exports.getCategories = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};

// [POST] /api/categories - Thêm danh mục
exports.createCategory = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};

// [PUT] /api/categories/:id - Sửa danh mục
exports.updateCategory = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};

// [DELETE] /api/categories/:id - Xóa danh mục (chặn nếu còn sách thuộc danh mục)
exports.deleteCategory = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};
