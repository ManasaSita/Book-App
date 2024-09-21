const mongoose = require('mongoose');
const { Schema } = mongoose;

const MyBooksSchema = new Schema({
  user_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true 
  },
  books: [
    {
      book_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Books', 
        required: true 
      },
      status: {
        type: String, 
        enum: ['to-read', 'reading', 'read', 'currently-reading'], 
        default: 'to-read' 
      },
      googleBooksId: { type: String, required: true },
      rating: Number,
      progress: Number,
      pagesRead: Number,
      review: String,
    }
  ]
});

module.exports = mongoose.model('MyBooks', MyBooksSchema);
