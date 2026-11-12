// models/review.model.js - collection "reviews" (Đánh giá sách)
// Người phụ trách: Người 2
const { Schema, model } = require('mongoose');

const reviewSchema = new Schema({
    bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Vui lòng cung cấp ID sách'],
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vui lòng cung cấp ID người dùng'],
    },
    userName: {
        type: String,
        trim: true,
    },
    rating: {
        type: Number,
        required: [true, 'Vui lòng chọn số sao đánh giá'],
        validate: { validator: value => Number.isInteger(value * 2), message: 'Điểm phải theo bước 0,5 sao' },
        min: [0.5, 'Đánh giá tối thiểu 0,5 sao'],
        max: [5, 'Đánh giá tối đa 5 sao'],
    },
    comment: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung đánh giá'],
        maxlength: 2000,
        trim: true,
    },
}, {
    collection: 'reviews',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Mỗi bạn đọc chỉ viết 1 đánh giá cho 1 cuốn sách
reviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

const Review = model('Review', reviewSchema);
module.exports = Review;
