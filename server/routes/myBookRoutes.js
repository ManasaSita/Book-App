const express = require('express');
const router = express.Router();
const { getMyBooks, deleteBook, addBookFromSearch, rateBook,
    updateBookStatus, updateBookProgress, getCurrentlyReadingBooks, 
    addReview, getReviews, getBookDetails, editReview, deleteReview } = require('../controllers/myBookController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getMyBooks);
router.delete('/:id', deleteBook);
router.post('/add-from-search', addBookFromSearch);
// router.post('/:id/rate', rateBook);
router.put('/progress', updateBookProgress);
router.put('/update-status/:bookId?', updateBookStatus);
router.get('/dashboard', getCurrentlyReadingBooks);

router.get('/:bookId?', getBookDetails);
router.post('/review/:bookId?', addReview);
router.get('/review/:bookId?', getReviews);
router.put('/review/:bookId?', editReview);
router.delete('/review/:bookId?', deleteReview);


module.exports = router;