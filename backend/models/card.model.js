// models/card.model.js - collection "cards" (Thẻ thư viện)
// Quan hệ 1 - 1: mỗi độc giả chỉ có 1 thẻ (userId unique)
// Người phụ trách: Người 1
const { Schema, model } = require('mongoose');

const cardSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Vui lòng chọn độc giả'],
        unique: true,
    },
    cardCode: {
        type: String,
        required: true,
        unique: true,
    },
    issueDate: {
        type: Date,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    // active: đang dùng · locked: bị khóa (hết hạn được tính theo expiryDate)
    status: {
        type: String,
        enum: ['active', 'locked', 'expired'],
        default: 'active',
    },
}, {
    collection: 'cards',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual: trạng thái thực tế (thẻ active nhưng đã qua ngày hết hạn -> expired)
cardSchema.virtual('currentStatus').get(function () {
    if (this.status === 'active' && this.expiryDate < new Date()) return 'expired';
    return this.status;
});

const Card = model('Card', cardSchema);
module.exports = Card;
