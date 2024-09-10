require('dotenv').config();  // Load environment variables from .env file
const mongoose = require('mongoose');
const Books = require('./models/book');  // Assuming you have the Book model
const MyBooks = require('./models/myBooks');  // Assuming you have the MyBooks model

// Function to handle the migration
async function migrateBooksData() {
  try {
    // Fetch all documents from MyBooks collection
    const myBooksList = await MyBooks.find();

    console.log("myBooksList--", myBooksList.length);
    

    for (let userBooks of myBooksList) {
      const uniqueBooks = new Map();

      // Iterate through the user's books and remove duplicates
      const filteredBooks = [];
      for (let userBook of userBooks.books) {
        const bookId = userBook.book_id.toString();
        console.log("bookId-------", bookId);
        

        // Check if the book already exists in the uniqueBooks map
        if (uniqueBooks.has(bookId)) {
          console.log(`Duplicate book found for user ${userBooks.user_id}: ${bookId}`);
          continue; // Skip this book if it's a duplicate
        }

        // Check if the book exists in the Books collection
        const bookExists = await Books.exists({ _id: bookId });
        console.log("bookExists-------", bookExists);
        

        if (!bookExists) {
          console.log(`Invalid book reference found for user ${userBooks.user_id}: ${bookId}`);
          continue; // Skip this book if it doesn't exist in the Books collection
        }

        // Add the book to the uniqueBooks map and filteredBooks array
        uniqueBooks.set(bookId, true);
        filteredBooks.push(userBook);

        console.log("uniqueBooks-----------", uniqueBooks);
        console.log("filteredBooks---------------------", filteredBooks);
        
    }

      // Update the user's books with the filtered list
      userBooks.books = filteredBooks;
      await userBooks.save();
    }

    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    migrateBooksData();
  })
  .catch(err => console.log('MongoDB connection error:', err));
