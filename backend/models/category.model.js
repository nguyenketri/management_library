// models/category.model.js - collection "categories" (Danh mục sách)
// Người phụ trách: Người 2
const { Schema, model } = require('mongoose');

const categorySchema = new Schema({
    name: {
        type: String,
        // TODO: required, unique, trim
    },
    description: { type: String },
}, {
    collection: 'categories',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const Category = model('Category', categorySchema);
module.exports = Category;
