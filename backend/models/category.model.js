// models/category.model.js - collection "categories" (Danh mục sách)
// Người phụ trách: Người 2
const { Schema, model } = require('mongoose');

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên danh mục'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    collection: 'categories',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

const Category = model('Category', categorySchema);
module.exports = Category;
