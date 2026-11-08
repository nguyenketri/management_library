// Người phụ trách: Người 2
// const mongoose = require('mongoose');
// const Review = require('../models/review.model');

// [GET] /api/reviews - Lấy đánh giá (?bookId=...)
exports.getReviews = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};

// [POST] /api/reviews - Viết đánh giá (chỉ khi đã mượn sách)
exports.createReview = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};

// [DELETE] /api/reviews/:id - Xóa đánh giá
exports.deleteReview = async (req, resp, next) => {
    try {
        // TODO
        return resp.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        next(error);
    }
};
