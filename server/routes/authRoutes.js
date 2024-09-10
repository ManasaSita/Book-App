const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { sendFriendRequest, fetchFriendRequests, respondToFriendRequest, fetchFriends, searchUsers, 
    getFriendDetails, postComment, getDetails, deleteComment, 
    fetchMessages, sendMessage } = require('../controllers/friendController'); // Import new controller methods
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login a user
// @access  Public
router.post('/login', login);

router.use(authMiddleware);

// Friend routes
router.post('/friends/send', sendFriendRequest);
router.get('/friends/requests', fetchFriendRequests);
router.post('/friends/accept', respondToFriendRequest);
router.post('/friends/decline', respondToFriendRequest);
router.get('/friends/:userId', fetchFriends);
router.get('/search', searchUsers);
router.get('/friends/details/:id?', getFriendDetails);
router.post('/friends/comment', postComment);
router.get('/profile/:userId', getDetails);
router.delete('/friends/delete-comment', deleteComment);
router.get('/friends/messages/:friendId', fetchMessages);
router.post('/friends/messages', sendMessage);

module.exports = router;