const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String },
  author: { type: String },
  description: { type: String},
  thumbnail: { type: String },
  averageRating: { type: Number },
  pageCount: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Books', bookSchema);
