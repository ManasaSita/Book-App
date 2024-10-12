// controllers/friendController.js
const mongoose = require('mongoose');
const Users = require('../models/user');
const FriendRequests = require('../models/friendRequests');
const Friends = require('../models/friend'); // You might need to create this model if not present
const MyBooks = require('../models/myBooks');
const Books = require('../models/book');
const Messages = require('../models/message');

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    console.log("sendFriendRequest------", req.body);
    const { receiverId, senderId } = req.body;

    // Ensure receiver and sender are not the same
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send a friend request to yourself' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequests.findOne({ sender: senderId, receiver: receiverId });
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Create and save new friend request
    const newRequest = new FriendRequests({ sender: senderId, receiver: receiverId });
    await newRequest.save();

    res.status(200).json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).send('Server error');
  }
};

// Get friend requests for the current user
exports.fetchFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await FriendRequests.find({ receiver: userId }).populate('sender', 'username email');
    res.status(200).json({ receivedRequests: requests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).send('Server error');
  }
};

// Respond to a friend request
exports.respondToFriendRequest = async (req, res) => {
  try {
    console.log("respondToFriendRequest----------",req.body);
    
    const { senderId, requestId, action } = req.body; // action can be 'accept' or 'decline'
    // const userId = req.user.id;

    const request = await FriendRequests.findById(requestId);
    console.log("FriendRequests-------", request);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    console.log("request.receiver-------", request.sender.toString());
    console.log("senderId----------", senderId);
    
    if (request.sender.toString() !== senderId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (action === 'accept') {
      // Add friends
      await Friends.create({ user: request.sender, friend: request.receiver });
      await Friends.create({ user: request.receiver, friend: request.sender });
      // Remove the friend request
      await FriendRequests.findByIdAndDelete(requestId);
      res.status(200).json({ message: 'Friend request accepted' });
      return;
    } else if (action === 'decline') {
      // Remove the friend request
      await FriendRequests.findByIdAndDelete(requestId);
      res.status(200).json({ message: 'Friend request declined' });
      return;
    } else {
      res.status(400).json({ message: 'Invalid action' });
      return;
    }
  } catch (error) {
    console.error('Error responding to friend request:', error);
    res.status(500).send('Server error');
  }
};

// Get friends of the current user
exports.fetchFriends = async (req, res) => {
  console.log('fetchFriends controller started.', req.params);
  
  try {
    const { userId }= req.params;
    // console.log('User ID:', userId);

    const friends = await Friends.find({ user: userId });
    console.log('Friends found:', friends);

    const friendIds = friends.map(friend => friend.friend);

    const users = await Users.find({_id: { $in: friendIds } }).select('username');

    if (!res.headersSent) {
      // console.log('Sending friends list response.');
      res.status(200).json(users);
      return;
    } else {
      console.error('Headers were already sent when trying to send friends list.');
      return;
    }
  } catch (error) {
    console.error('Error fetching friends:', error);

    if (!res.headersSent) {
      console.log('Sending error response.');
      res.status(500).send('Server error');
    } else {
      console.error('Headers were already sent when trying to send an error response.');
    }
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    console.log("searchUser------", req.query, req.params);
    
    const { username } = req.query;
    const { userId } = req.params;

    // Find users with matching username, excluding the user with the given userId
    let users = await Users.find({
      username: new RegExp(username, 'i'),
      _id: { $ne: userId } // Exclude the user with _id equal to userId
    });

    // Get the list of friend IDs for the searching user
    const friendships = await Friends.find({ user: userId });
    const friendIds = friendships.map(friendship => friendship.friend.toString());

    // Filter out users who are already friends
    users = users.filter(user => !friendIds.includes(user._id.toString()));

    console.log("users-------", users);
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).send('Server error');
  }
};

// Get details of a specific friend
exports.getFriendDetails = async (req, res) => {
  console.log("getFriendDetails controller called");

  try {
    const friendId = req.params.id;
    console.log("getFriendDetails---------controller---", friendId);

    // Find the user by ID
    const friendProfile = await Users.findById(friendId).select('username email');

    if (!friendProfile) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    // Convert Mongoose document to a plain JavaScript object
    const friendProfileObject = friendProfile.toObject();

    // Fetch comments related to the friend
    const commentsData = await Friends.find({ friend: friendId }).select('comments');
    console.log("comments------------", commentsData);

    // Initialize an array to hold all comments with usernames
    let allComments = [];

    // Iterate through all documents with comments
    for (const doc of commentsData) {
      for (const comment of doc.comments) {
        allComments.push(comment);
      }
    }

    // Extract the user IDs of commenters
    const commenterIds = allComments.map(comment => comment.commenter);

    // Fetch the usernames of the commenters
    const commenterProfiles = await Users.find({ _id: { $in: commenterIds } }).select('username');

    // Create a map of commenter IDs to usernames
    const commenterMap = commenterProfiles.reduce((map, user) => {
      map[user._id] = user.username;
      return map;
    }, {});

    // Add the username to each comment
    const commentsWithUsernames = allComments.map(comment => ({
      ...comment.toObject(),
      commenterUsername: commenterMap[comment.commenter] || 'Unknown'
    }));

    console.log("comments count---------", commentsWithUsernames.length);
    

    // Attach comments with usernames to the friend profile object
    friendProfileObject.comments = commentsWithUsernames;

    // Find the books related to the friend
    const friendBooks = await MyBooks.findOne({ user_id: friendId });

    if (!friendBooks) {
      // If no books found, return the profile with an empty book list
      return res.status(200).json({ friendProfile: friendProfileObject, detailedBooks: [] });
    }

    // Extract book IDs from the friendBooks.books array
    const bookIds = friendBooks.books.map(book => book.book_id);

    // Find the details of these books from the Books collection
    const booksDetails = await Books.find({ _id: { $in: bookIds } });

    // Map the booksDetails to include additional info like status, rating, etc.
    const detailedBooks = friendBooks.books.map(userBook => {
      const bookDetail = booksDetails.find(book => book._id.equals(userBook.book_id));

      if (bookDetail) {
        return {
          ...bookDetail.toObject(),
          status: userBook.status,
          rating: userBook.rating,
          progress: userBook.progress,
          pagesRead: userBook.pagesRead,
        };
      } else {
        return {
          status: userBook.status,
          rating: userBook.rating,
          progress: userBook.progress,
          pagesRead: userBook.pagesRead,
        };
      }
    });

    // console.log("friendProfile-------------", friendProfileObject);

    res.status(200).json({ friendProfile: friendProfileObject, detailedBooks });
  } catch (error) {
    console.error('Error fetching friend details:', error);
    res.status(500).send('Server error');
  }
};

exports.postComment = async (req, res) => {
  try {
    const { commenterId, friendId, text, bookId, bookDetails } = req.body;

    console.log("Received data for posting comment:", req.body);
    console.log("Commenter ID:", commenterId);

    if (!friendId || (!text && !bookDetails)) {
      return res.status(400).json({ message: 'Friend ID and either content or book details are required' });
    }

    if (!commenterId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const friendship = await Friends.findOne({ user: commenterId, friend: friendId });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    let book;
    if (bookDetails) {
      // Check if the book already exists in the Books collection
      book = await Books.findOne({ googleBooksId: bookDetails.googleBooksId });
      if (!book) {
        // If the book doesn't exist, create a new one
        book = new Books(bookDetails);
        await book.save();
      }
    }

    const comment = {
      commenter: commenterId,
      targetUser: friendId,
      content: bookDetails 
        ? `I suggest you read "${bookDetails.title}". Click here to see details:` 
        : text,
      createdAt: new Date(),
    };

    if (book) {
      comment.bookLink = book._id.toString();
    } else if (bookId) {
      const bookExists = await Books.findById(bookId);
      if (!bookExists) {
        return res.status(404).json({ message: 'Book not found' });
      }
      console.log("bookExists----------", bookExists);
      comment.bookLink = bookExists.googleBooksId;
    }

    try {
      friendship.comments.push(comment);
      await friendship.save();
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        console.error('Mongoose validation error:', error.errors);
        return res.status(400).json({ errors: error.errors });
      } else {
        console.error('Error posting comment:', error);
        return res.status(500).send('Server error');
      }
    }

    // Get all friendships for the friend (to retrieve all comments)
    const allFriendships = await Friends.find({ friend: friendId });

    // Extract all comments from all friendships
    let allComments = [];
    allFriendships.forEach(friendship => {
      allComments = allComments.concat(friendship.comments);
    });

    // Extract unique commenter IDs from all comments
    const commenterIds = [...new Set(allComments.map(comment => comment.commenter))];

    // Fetch usernames of all commenters
    const commenterProfiles = await Users.find({ "_id": { $in: commenterIds } }).select('username');
    
    const commenterMap = commenterProfiles.reduce((map, user) => {
      map[user._id.toString()] = user.username;
      return map;
    }, {});

    // Add username to each comment
    const commentsWithUsernames = allComments.map(comment => ({
      ...comment.toObject(),
      commenterUsername: commenterMap[comment.commenter.toString()] || 'Unknown'
    }));

    res.status(201).json({ 
      message: bookDetails ? 'Book suggested successfully' : 'Comment posted successfully', 
      commentsWithUsernames,
      bookId: book ? book._id : undefined
    });

  } catch (error) {
    console.error('Error posting comment or suggesting book:', error);
    res.status(500).send('Server error');
  }
};

// Delete Comment
// Delete Comment by Target User (Dashboard)
exports.deleteCommentByTargetUser = async (req, res) => {
  const { userId, commentId } = req.body; // userId refers to the targetUser
  console.log("deleteCommentByTargetUser----------controller-----------",  req.body);
  
  try {
    const updatedFriendDoc = await Friends.findOneAndUpdate(
      { 'comments.targetUser': userId, 'comments._id': commentId },
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    ).select('comments');

    if (!updatedFriendDoc) {
      return res.status(404).json({ message: 'Comment not found or unauthorized to delete' });
    }

    // Return the updated comments list
    return res.status(200).json({ comments: updatedFriendDoc.comments });
  } catch (error) {
    console.error('Error deleting comment by target user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Comment by Commenter (FriendProfile)
exports.deleteCommentByCommenter = async (req, res) => {
  const { userId, commentId } = req.body; // userId refers to the commenter

  try {
    const updatedFriendDoc = await Friends.findOneAndUpdate(
      { 'comments.commenter': userId, 'comments._id': commentId },
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    ).select('comments');

    if (!updatedFriendDoc) {
      return res.status(404).json({ message: 'Comment not found or unauthorized to delete' });
    }

    // Return the updated comments list
    return res.status(200).json({ comments: updatedFriendDoc.comments });
  } catch (error) {
    console.error('Error deleting comment by commenter:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch all messages between the current user and a friend
exports.fetchMessages = async (req, res) => {
  console.log("fetchMessages----------controller-------", req.params, req.params);
  
  try {
    const { senderId } = req.query; // Retrieve senderId from the query parameters
    const { friendId } = req.params;

    const messages = await Messages.find({
      $or: [
        { sender: senderId, receiver: friendId },
        { sender: friendId, receiver: senderId }
      ]
    }).sort('createdAt');

    console.log("fetchMessages----------controller-------", messages);

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server error');
  }
};

// Send a message to a friend
exports.sendMessage = async (req, res) => {
  console.log("sendMessage------------controller---------", req.body);
  
  try {
    const { senderId, friendId, content } = req.body;
    // const senderId = req.user.id;

    const newMessage = new Messages({
      sender: senderId,
      receiver: friendId,
      content
    });

    await newMessage.save();
    res.status(200).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Server error');
  }
};

exports.getComments = async (req, res) => {
  console.log("getComments controller called");

  try {
    const userId = req.params.id;
    console.log("getComments---------controller---", userId);

    // Find all friend documents where the current user is the targetUser in comments
    const friendDocuments = await Friends.find({
      'comments.targetUser': userId
    }).populate({
      path: 'comments.commenter',
      select: 'username' // Only fetch the username of the commenter
    });

    // Extract and format the comments
    let comments = [];
    friendDocuments.forEach(doc => {
      doc.comments.forEach(comment => {
        if (comment.targetUser.toString() === userId) {
          comments.push({
            id: comment._id,
            commenterUsername: comment.commenter.username,
            content: comment.content,
            createdAt: comment.createdAt,
            bookLink: comment.bookLink // Include this if you want to fetch book details
          });
        }
      });
    });

    // Sort comments by createdAt in descending order (most recent first)
    comments.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
