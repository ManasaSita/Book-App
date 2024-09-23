import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://book-app-og0e.onrender.com/api' || 'http://localhost:5000/api';
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;  
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth-related API calls
export const register = async (userData) => {
  try {
    // console.log("userData--------", userData);
    
    const response = await api.post('/auth/register', userData);
    // console.log("response-----", response);
    
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    // console.log("login------", email, password);
    
    const response = await api.post('/auth/login', {email, password});
    // console.log("response--------", response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Friend-related API calls
export const sendFriendRequest = async (receiverId, senderId) => {
  try {
    const response = await api.post('/auth/friends/send', { receiverId, senderId });
    return response.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

export const fetchFriendRequests = async () => {
  try {
    const response = await api.get('/auth/friends/requests');
    return response.data;
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    throw error;
  }
};

export const respondToFriendRequest = async (senderId, requestId, action) => {
  try {
    const endpoint = action === 'accept' ? '/auth/friends/accept' : '/auth/friends/decline';
    const response = await api.post(endpoint, { senderId, requestId, action });
    return response.data;
  } catch (error) {
    console.error('Error responding to friend request:', error);
    throw error;
  }
};

export const fetchFriends = async (userId) => {
  try {
    const response = await api.get(`/auth/friends/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

export const searchUsers = async (username, userId) => {
  // console.log("searchUsers---------",username, userId);
  try {
    const response = await api.get(`/auth/search/${userId}?username=${encodeURIComponent(username)}`);
    // console.log("response--------", response); 
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const getFriendDetails = async (friendId) => {
  try {
    const response = await api.get(`/auth/friends/details/${friendId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching friend details:', error);
    throw error;
  }
};

// Comment-related API calls
export const postComment = async (commentData) => {
  try {    
    // console.log("postComment-----", commentData);
    const response = await api.post(`/auth/friends/comment`, commentData);    
    // console.log("response-----", response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
};

export const getDetails = async (userId) => {
  try {
    const response = await api.get(`/auth/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const deleteCommentByTargetUser = async (commentData) => {
  // console.log("deleteCommentByTargetUser------------", commentData);

  try {
    const response = await api.delete(`/auth/friends/user/delete-comment`, {
      data: commentData,
    });
    // console.log(response.data);

    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const deleteCommentByCommenter = async (commentData) => {
  // console.log("deleteCommentByCommenter------------", commentData);

  try {
    const response = await api.delete(`/auth/friends/commenter/delete-comment`, {
      data: commentData,
    });
    // console.log(response.data);

    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// New API call for fetching comments
export const getComments = async (userId) => {
  try {
    const response = await api.get(`/auth/friends/comments/${userId}`);
    // console.log("getComments response:", response.data);
    return response.data.comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Message-related API calls
export const fetchMessages = async (senderId,friendId) => {
  try {
    const response = await api.get(`/auth/friends/messages/${friendId}`, {
      params: {
        senderId: senderId
      }
    });
    // console.log("response-----", response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    const response = await api.post(`/auth/friends/messages`, messageData);
    // console.log("sendMessage--------", response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Book-related API calls
export const createBook = async (bookData) => {
  try {
    const response = await api.post(`/books`, bookData);
    return response.data;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

export const getBook = async (bookId) => {
  try {
    const response = await api.get(`/books/suggested/${bookId}`);
    // console.log(response);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

export const getBookWithStatus = async (bookId, userId) => {
  try {
    // console.log("getBookWithStatus-------", userId,bookId );
    const response = await api.get(`/books/${bookId}/status`, {
      params: { userId }  // Sending userId as a query parameter
    });    
    return response.data;
  } catch (error) {
    console.error('Error fetching book with status:', error);
    throw error;
  }
};

// MyBook-related API calls
export const getMyBooks = async (userId) => {
  // console.log("getMyBooks---API--", userId);
  
  const response = await api.get(`/mybooks?userId=${userId}`);  // Pass userId as a query parameter
  return response.data;
};


export const deleteBook = async (id) => {
  try {
    const response = await api.delete(`/mybooks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};

export const addBookFromSearch = async (bookData, userId) => {
  // console.log("api-----", bookData, userId);
  
  try {
    const response = await api.post(`/mybooks/add-from-search`, {bookData, userId});
    return response;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

export const rateBook = async (id, ratingData) => {
  try {
    const response = await api.post(`/mybooks/${id}/rate`, ratingData);
    return response.data;
  } catch (error) {
    console.error('Error rating book:', error);
    throw error;
  }
};

export const updateBookProgress = async (progressData) => {
  try {
    // console.log("updateBookProgress--------", progressData);
    
    const response = await api.put(`/mybooks/progress`, progressData);
    return response.data;
  } catch (error) {
    console.error('Error updating book progress:', error);
    throw error;
  }
};

export const updateBookStatus = async ( userId, bookId, status) => {
  try {
    const response = await api.put(`/mybooks/update-status/${bookId}`,{ userId, status });
    return response.data;
  } catch (error) {
    console.error('Error updating book status:', error);
    throw error;
  }
};

export const getCurrentlyReadingBooks = async (userId) => {
  try {
    // console.log("userId----------", userId);
    
    const response = await api.get(`/mybooks/dashboard?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching currently reading books:', error);
    throw error;
  }
};

export const getBookDetails = async (bookId) => {
  try {
    const response = await api.get(`/books/${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

export const addReview = async (userId,bookId, reviewData) => {
  try {
    const response = await api.post(`/mybooks/review/${bookId}`, {userId, reviewData});
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getReviews = async (bookId) => {
  try {
    const response = await api.get(`/mybooks/review/${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
}

export const editReview = async (userId, bookId, reviewData) => {
  try {
    const response = await api.put(`/mybooks/review/${bookId}`, {userId, reviewData});
    return response.data;
  } catch (error) {
    console.error('Error editing review:', error);
    throw error;
  }
};

export const deleteReview = async (userId, bookId) => {
  // console.log('deleteReview------- api',userId, bookId);
  
  try {
    const response = await api.delete(`/mybooks/review/${bookId}?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const searchBooks = async (query) => {
  // console.log("searching----", query);
  
  try {
    const response = await axios.get(`${GOOGLE_BOOKS_API}?q=${query}`);
    // console.log("response--------", response.data);
    
    return response.data.items;
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
};
