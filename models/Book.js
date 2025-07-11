const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: false }, // Made optional - will be extracted from PDF or left empty
  description: { type: String },
  coverImage: { type: String },
  pdfFile: { type: String },
  category: { type: String },
  available: { type: Boolean, default: true },
  published: { type: Boolean, default: true }, // Books are published immediately when uploaded
  publishedAt: { type: Date, default: Date.now },
  readCount: { type: Number, default: 0 }, // Track how many times book has been read
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Book', bookSchema); 