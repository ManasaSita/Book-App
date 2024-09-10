require('dotenv').config(); // Load environment variables from .env

const mongoose = require('mongoose');
const MyBooks = require('./models/myBooks'); // Adjust the path as needed

// Connect to your MongoDB database using the connection string from .env file
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const removeReviewIdField = async () => {
  try {
    // Use MongoDB's updateMany with $unset to remove review_id from all books
    const result = await MyBooks.updateMany(
      { 'books.review_id': { $exists: true } }, // Filter where review_id exists
      { $unset: { 'books.$[].review_id': 1 } } // Remove the review_id field
    );

    console.log(`Successfully updated ${result.nModified} documents.`);

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the migration
removeReviewIdField();
