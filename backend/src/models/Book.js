const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tên sách'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Vui lòng nhập tên tác giả'],
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Chung',
      trim: true,
    },
    publishedYear: {
      type: Number,
    },
    totalCopies: {
      type: Number,
      default: 1,
      min: [0, 'Số lượng không thể âm'],
    },
    availableCopies: {
      type: Number,
      default: 1,
      min: [0, 'Số lượng khả dụng không thể âm'],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Book', bookSchema);
