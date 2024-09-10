const express = require('express');
const router = express.Router();
const axios = require('axios');
const { createBook, updateBook, getBook,  getBookWithStatus } = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

console.log("BookRoutes--------enter");

router.use(authMiddleware);

router.get('/:bookId/status', getBookWithStatus);
router.post('/', createBook);
router.put('/:id', updateBook);



module.exports = router;