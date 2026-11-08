// models/card.model.js - collection "cards" (Thẻ thư viện (1 user - 1 thẻ))
// Người phụ trách: Người 1
const { Schema, model } = require('mongoose');

const cardSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // TODO: required, unique (quan hệ 1-1)
    },
    cardCode: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    status: { type: String }, // TODO: enum ['active', 'locked', 'expired']
}, {
    collection: 'cards',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const Card = model('Card', cardSchema);
module.exports = Card;
