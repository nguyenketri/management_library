// models/review.model.js - collection "reviews" (Đánh giá sách (n review - 1 sách, n review - 1 user))
// Người phụ trách: Người 2
const { Schema, model } = require('mongoose');

const reviewSchema = new Schema({
    bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    rating: { type: Number }, // TODO: min 1, max 5
    comment: { type: String },
}, {
    collection: 'reviews',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const Review = model('Review', reviewSchema);
module.exports = Review;
