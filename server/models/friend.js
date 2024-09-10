// models/friend.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, // User who comments
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, // Friend's profile being commented on
  content: { type: String, required: true }, // The comment content
  bookLink: { type: mongoose.Schema.Types.ObjectId, ref: 'Books', required: false }, // Optional book recommendation
  createdAt: { type: Date, default: Date.now }
});

const friendSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  friend: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Friends', friendSchema);
