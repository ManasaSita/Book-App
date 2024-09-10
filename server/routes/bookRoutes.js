const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createBook, updateBook, getBook,  getBookWithStatus } = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

console.log("BookRoutes--------enter");

router.get('/search-books', async (req, res) => {
  try {
    const query = req.query.q;
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    res.json(response.data.items);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books', error: error.message });
  }
});

router.use(authMiddleware);

router.get('/:bookId/status', getBookWithStatus);
router.post('/', createBook);
router.put('/:id', updateBook);



module.exports = router;