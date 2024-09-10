// const Reviews = require('../models/reviews');
// const MyBooks = require('../models/myBooks');

// exports.addReview = async (req, res) => {
//   try {
//     const { bookId, userId, review: reviewText } = req.body;
//     const review = new Reviews({
//       user_id: userId,
//       book_id: bookId,
//       review: reviewText,
//     })

//     await review.save();
//     console.log("review------", review);

//     // Update the review_id in MyBooks collection
//     await MyBooks.updateOne(
//       { user_id: userId, 'books.book_id': bookId },
//       { $set: { 'books.$.review_id': review._id } }
//     );
    
//     res.json(review);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getReviews = async (req, res) => {
//   try {
//     const { bookId, userId } = req.params;
//     console.log("getReview------", req.params);
//     const review = await Reviews.find({user_id: userId, book_id: bookId});
//     res.json(review);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.editReview = async (req, res) => {
//     try {
//       const { userId, reviewId, newReview: reviewText } = req.body;
//       console.log("editReview------", req.body);
//       console.log(userId, reviewId, reviewText );
      
//       const review = await Reviews.findById(reviewId);
//       console.log("review----", review);
      
//       if (!review) {
//         return res.status(404).json({ message: 'Review not found' });
//       }
//       review.review = reviewText;
//       await review.save();
//       res.status(200).json({message: 'Review Updated'});
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Server error' });
//     }
// };

// exports.deleteReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const review = await Reviews.findByIdAndDelete(reviewId);
//     if (!review) {
//       return res.status(404).json({ message: 'Review not found' });
//     }
    
//     res.json({ message: 'Review removed' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };