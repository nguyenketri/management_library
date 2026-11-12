// controllers/review.controller.js - Quản lý đánh giá sách
// Người phụ trách: Người 2
const mongoose = require('mongoose');
const Review = require('../models/review.model');
const Book = require('../models/book.model');
const Borrow = require('../models/borrow.model');
const { bodyObject, text, reviewRating } = require('../utils/validation');

// [GET] /api/reviews?bookId=...
exports.getReviews = async (req, resp, next) => {
    try {
        const { bookId } = req.query;
        const filter = {};

        if (bookId) {
            if (!mongoose.Types.ObjectId.isValid(bookId)) {
                return resp.status(400).json({ error: `Invalid bookId: ${bookId}` });
            }
            filter.bookId = bookId;
        }

        const reviews = await Review.find(filter)
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 });

        const formatted = reviews.map((r) => {
            const obj = r.toObject();
            return {
                ...obj,
                userName: obj.userName || obj.userId?.name || 'Bạn đọc',
            };
        });

        return resp.status(200).json(formatted);
    } catch (error) {
        next(error);
    }
};

// [POST] /api/reviews - Viết đánh giá (chỉ khi đã mượn sách)
exports.createReview = async (req, resp, next) => {
    try {
        const body = bodyObject(req.body);
        const bookId = text(body.bookId, 'ID sách', 24, true);
        const rating = body.rating;
        const comment = text(body.comment, 'Nhận xét', 2000, true);
        const userId = req.user?.id;

        if (!userId) {
            return resp.status(401).json({ error: 'Bạn chưa đăng nhập' });
        }
        if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
            return resp.status(400).json({ error: 'ID sách không hợp lệ' });
        }

        const numericRating = reviewRating(rating);
        if (!comment || !comment.trim()) {
            return resp.status(400).json({ error: 'Vui lòng nhập nội dung đánh giá' });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return resp.status(404).json({ error: 'Không tìm thấy sách cần đánh giá' });
        }

        // Quy tắc: Độc giả chỉ được viết đánh giá khi đã từng mượn sách này
        const hasBorrowed = await Borrow.findOne({
            userId: { $in: [userId, String(userId)] },
            bookId: { $in: [bookId, String(bookId)] },
            status: { $in: ['borrowed', 'returned', 'overdue'] },
        });

        if (!hasBorrowed) {
            return resp.status(403).json({
                error: 'Bạn chỉ có thể đánh giá sách sau khi đã mượn cuốn sách này.',
            });
        }

        // Lưu hoặc cập nhật đánh giá của user
        const review = await Review.findOneAndUpdate(
            { bookId, userId },
            {
                bookId,
                userId,
                userName: req.user.name,
                rating: numericRating,
                comment: comment.trim(),
            },
            { new: true, upsert: true, runValidators: true }
        );

        // Cập nhật lại điểm đánh giá trung bình cho cuốn sách
        const allReviews = await Review.find({ bookId });
        if (allReviews.length > 0) {
            const avgRating = Number(
                (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
            );
            await Book.findByIdAndUpdate(bookId, { rating: avgRating });
        }

        return resp.status(201).json({
            ...review.toObject(),
            userName: req.user.name,
        });
    } catch (error) {
        next(error);
    }
};

// [DELETE] /api/reviews/:id - Xóa đánh giá
exports.deleteReview = async (req, resp, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return resp.status(400).json({ error: `Invalid reviewId: ${id}` });
        }

        const review = await Review.findById(id);
        if (!review) {
            return resp.status(404).json({ error: 'Không tìm thấy đánh giá cần xóa' });
        }

        // Chỉ chủ đánh giá hoặc admin/thủ thư mới có quyền xóa
        if (review.userId.toString() !== userId && !['admin', 'librarian'].includes(userRole)) {
            return resp.status(403).json({ error: 'Bạn không có quyền xóa đánh giá này' });
        }

        const bookId = review.bookId;
        await Review.findByIdAndDelete(id);

        // Tính lại điểm trung bình sau khi xóa
        const remainingReviews = await Review.find({ bookId });
        const avgRating = remainingReviews.length > 0
            ? Number((remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length).toFixed(1))
            : 5;
        await Book.findByIdAndUpdate(bookId, { rating: avgRating });

        return resp.status(200).json({ message: 'Đã xóa đánh giá thành công' });
    } catch (error) {
        next(error);
    }
};
