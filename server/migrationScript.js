require('dotenv').config();
const mongoose = require('mongoose');
const Books = require('./models/book');  // Assuming you have the Book model
const MyBooks = require('./models/myBooks');  // Assuming you have the MyBooks model

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    migrateBooksData();
  })
  .catch(err => console.log('MongoDB connection error:', err));


const migrateBooksData = async () => {
  try {
    const books = await Books.find({});

    console.log(`Number of books fetched: ${books.length}`);  

    for (const book of books) {
      // console.log("current books---", book);
      
      const { _id, user, rating, status, progress, createdAt } = book;
      console.log("id----", _id);
      console.log("user----", user);

      // Find or create the user's entry in myBooks
      let userBooks = await MyBooks.findOne({ user_id: user });
      // console.log(`MyBooks(userBooks):  ${userBooks.length}`);

      if (!userBooks) {
        userBooks = new MyBooks({ user_id: user, books: [] });
        console.log("new user created for: ", user);
      }

      // Add the book details to the user's myBooks collection
      userBooks.books.push({
        book_id: _id,
        status,
        rating,
        progress,
        review_id: null,  // Assuming you'll update this later if necessary
        addedAt: createdAt
      });

      console.log(`${_id} added to ${user}`);
      
      await userBooks.save();
      console.log(userBooks.books);

      // Update the original Book record to remove user-specific fields
      await Books.updateOne({ _id }, {
        $unset: { rating: "", status: "", progress: "", user: "" }
      });
    console.log("---------------------------------------------");
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  }
};

migrateBooksData();
