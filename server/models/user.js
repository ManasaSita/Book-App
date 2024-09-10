const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Users', userSchema);
