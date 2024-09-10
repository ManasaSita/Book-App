const MyBooks = require('../models/myBooks');
const Books = require('../models/book');

exports.getMyBooks = async (req, res) => {
  console.log("getMyBook Request Params:", req.query);
  console.log("getMyBook Request User:", req.user.id);

  try {
    const userId = req.query.userId;

    // Fetch user's books from MyBooks collection
    const data = await MyBooks.findOne({ user_id: userId });
    console.log("data------", data);

    // If no data found, return a 404 response and exit function
    if (!data) {
      res.status(404).end({ message: 'No books found for this user.' });
    }

    // Extract book IDs from the books array
    const bookIds = data.books.map(book => book.book_id);
    // console.log("bookIds-------", bookIds);

    // Fetch book details from Books collection using the extracted IDs
    const booksDetails = await Books.find({ _id: { $in: bookIds } });
    // console.log("bookDetails------", booksDetails);

    // Map book details with additional info (status, rating)
    const detailedBooks = data.books.map(userBook => {
      // console.log("userBook-----", userBook);
      
      const bookDetail = booksDetails.find(book => book._id.equals(userBook.book_id));
      // console.log("bookDetail----", bookDetail);      

      // if(bookDetail){
        return {
          ...bookDetail.toObject(), // Spread the book details
          status: userBook.status,
          rating: userBook.rating,
        };
      // }
    });

    console.log("detailedBooks---", detailedBooks.length);

    // Return the detailed books array as response
    res.status(200).json(detailedBooks);

  } catch (err) {
    // Log the error and send a 500 response if something goes wrong
    console.error("Error fetching user books:", err);

    res.status(500).send({ message: 'Server error' });
  }
};

// Delete a book from MyBooks collection
exports.deleteBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: bookId } = req.params;

    const userBooks = await MyBooks.findOne({ user_id: userId });

    if (!userBooks) {
      return res.status(404).json({ message: 'No books found for this user.' });
    }

    const bookIndex = userBooks.books.findIndex(book => book.book_id.toString() === bookId);

    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found in your collection' });
    }

    userBooks.books.splice(bookIndex, 1);
    await userBooks.save();

    res.json({ message: 'Book removed from your collection' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a book to MyBooks collection
exports.addBookFromSearch = async (req, res) => {
  console.log("addBookFromSearch---", req);
  
  try {
    const { bookData, userId } = req.body;
    const { title, author, description, thumbnail, averageRating, pageCount } = bookData;

    const newBook = new Books({
      title: title,
      author: author,
      description: description,
      thumbnail: thumbnail,
      averageRating: averageRating,
      pageCount: pageCount,
    });

    console.log("newBook-------", newBook);
    

    const savedBook = await newBook.save();

    const userBooks = await MyBooks.findOneAndUpdate(
      { user_id: userId },
      { $push: { books: { book_id: savedBook._id } } },
      { new: true, upsert: true }
    );

    res.status(201).json(userBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get currently-reading books for the logged-in user
exports.getCurrentlyReadingBooks = async (req, res) => {
  console.log("getCurrentlyReadingBooks---------", req.query);
  
  try {
    const {userId} = req.query;
    const data = await MyBooks.findOne({ "user_id": userId });

    if (!data) {
      return res.status(404).json({ message: 'No books found for this user.' });
    }

    // Filter the books to get only those with status "currently-reading"
    const currentlyReadingBooks = data.books.filter(book => book.status === 'currently-reading');

    if (currentlyReadingBooks.length === 0) {
      return res.status(200).json({ message: 'No currently-reading books found.' });
    }

    const bookIds = currentlyReadingBooks.map(book => book.book_id);
    const booksDetails = await Books.find({ _id: { $in: bookIds } });

    const detailedBooks = currentlyReadingBooks.map(userBook => {
      const bookDetail = booksDetails.find(book => book._id.equals(userBook.book_id));
      return {
        ...bookDetail.toObject(),
        progress: userBook.progress,
        pagesRead: userBook.pagesRead,
      };
    });

    console.log("detailedBooks------", detailedBooks.length);
    

    res.status(200).json(detailedBooks);
  } catch (err) {
    console.error("Error fetching currently-reading books:", err);
    res.status(500).send({ message: 'Server error' });
  }
};

// Rate a book in MyBooks collection
exports.rateBook = async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const userBooks = await MyBooks.findOne({ user_id: userId });

    if (!userBooks) {
      return res.status(404).json({ message: 'No books found for this user.' });
    }

    const book = userBooks.books.find(book => book.book_id.toString() === bookId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found in your collection' });
    }

    book.rating = rating;
    await userBooks.save();

    res.json(userBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update book status in MyBooks collection
exports.updateBookStatus = async (req, res) => {
  console.log("updateBookStatus---", req.body, req.params);

  try {
    
    const { bookId } = req.params;
    const {  userId, status} = req.body;
    // const userId = req.user.id;

    const userBooks = await MyBooks.findOneAndUpdate(
      { user_id: userId, 'books.book_id': bookId },
      { $set: { 'books.$.status': status } },
      { new: true }
    );
    console.log("hdbfgerf", userBooks);
    

    if (!userBooks) {
      return res.status(404).json({ message: 'Book not found in your collection' });
    }

    res.json(userBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update book progress in MyBooks collection
exports.updateBookProgress = async (req, res) => {
  try {

    console.log("updateBookProgress--------", req.body);
    
    const { userId, bookId, progress, pagesRead } = req.body;

    // Update the user's progress in the MyBooks collection
    const updatedBook = await MyBooks.findOneAndUpdate(
      { user_id: userId, 'books.book_id': bookId },
      { $set: { 'books.$.progress': progress, 'books.$.pagesRead' :pagesRead } },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ success: false, message: 'User or book not found in myBooks' });
    }

    res.status(200).json({ success: true, data: updatedBook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBookDetails = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    // console.log("userId------", req);
    const data = await MyBooks.findOne({user_id: userId, 'books.book_id': bookId},  { 'books.$': 1 });
    console.log("data---", data);
    
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.addReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const {userId, reviewData: review } = req.body;

    console.log("addReview-------------", review);
    

    // Find the book in the user's collection and update the review
    const userBooks = await MyBooks.findOneAndUpdate(
      { user_id: userId, 'books.book_id': bookId },
      {
        $set: { 'books.$.review': review } // Update the review field
      },
      { new: true } // Return the updated document
    );

    if (!userBooks) {
      return res.status(404).json({ message: 'Book not found in your collection' });
    }

    console.log("userBooks------", userBooks);
    
    res.json(userBooks); // Return the updated document to the client
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    console.log("getReview------", req.params);
    const review = await MyBooks.find({'books.book_id': bookId});
    console.log("reviews------", review);
    
    res.json(review.review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.editReview = async (req, res) => {
    try {
      const { userId, reviewData: newReview } = req.body;
      const {bookId } = req.params;
      console.log("editReview------", req.body);
      
      // Find the book in the user's collection and update the review
      const userBooks = await MyBooks.findOneAndUpdate(
        { user_id: userId, 'books.book_id': bookId },
        {
          $set: { 'books.$.review': newReview } // Update the review field
        },
      );

      if (!userBooks) {
        return res.status(404).json({ message: 'Book not found in your collection' });
      }
      await userBooks.save();
      res.status(200).json({message: 'Review Updated'});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;
    console.log("deleteReview------", bookId, userId);
    
    // Find the book in the user's collection and update the review
    const userBooks = await MyBooks.findOneAndUpdate(
      { user_id: userId, 'books.book_id': bookId },
      {
        $set: { 'books.$.review': null } // Update the review field
      },
    );

    if (!userBooks) {
      return res.status(404).json({ message: 'Book not found in your collection' });
    }
    await userBooks.save();
    
    res.json({ message: 'Review removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};