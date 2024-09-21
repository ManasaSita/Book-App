const Books = require('../models/book');
const MyBooks = require('../models/myBooks');

// Create a new book
exports.createBook = async (req, res) => {
  try {
    console.log("user--", req);
    
    const { title, author, description, thumbnail, averageRating, pageCount, googleBooksId } = req.body;
    const newBook = new Books({
      title,
      author,
      description,
      thumbnail,
      averageRating,
      pageCount,
      googleBooksId,
    });
    const book = await newBook.save();
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all books for a user
exports.getBook = async (req, res) => {
  try {
    console.log("getBook------", req.params);
    const {bookId} = req.params;
    console.log(bookId);
    
    const books = await Books.findById(bookId);
    console.log(books);
    
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single book along with its status, rating, and review from the user's collection
exports.getBookWithStatus = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId } = req.query;  // Retrieve userId from query parameters

    if (!bookId || !userId) {
      return res.status(400).json({ message: 'Book ID and User ID are required' });
    }

    // Fetch the book details from the Books collection
    const book = await Books.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    console.log("book------------", book);

    // Fetch the book status, rating, and review from MyBooks collection
    const userBookDetails = await MyBooks.findOne({
      user_id: userId,
      'books.book_id': bookId,
    }, {
      'books.$': 1, // This projects only the specific book object that matches the bookId
    });

    if (!userBookDetails) {
      return res.status(404).json({ message: 'User book details not found' });
    }

    const bookWithStatus = {
      ...book.toObject(),
      status: userBookDetails.books[0].status,
      rating: userBookDetails.books[0].rating,
      review: userBookDetails.books[0].review, // Assuming review is a field
      progress: userBookDetails.books[0].progress,
      pagesRead: userBookDetails.books[0].pagesRead,
    };

    res.json(bookWithStatus);
  } catch (err) {
    console.error("getBookWithStatus Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    console.log("update-------");
    
    const { title, author, description, rating, status } = req.body;
    let book = await Books.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    // if (book.user.toString() !== req.user.id) {
    //   return res.status(401).json({ message: 'Not authorized' });
    // }
    book = await Books.findByIdAndUpdate(
      req.params.id,
      { title, author, description, rating, status },
      { new: true }
    );
    console.log("Updated-------");
    
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
