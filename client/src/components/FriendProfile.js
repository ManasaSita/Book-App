import React, { useEffect, useState } from 'react';
import { getFriendDetails, postComment, deleteCommentByCommenter, searchBooks, addBookFromSearch } from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import Notification from './Notification';

const FriendProfile = ({ friendId }) => {
  const { user } = useAuth(); 
  const userData= user?.payload?.user;
  const [friendDetails, setFriendDetails] = useState(null);
  const [books, setBooks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState('all');
  const [suggestBookQuery, setSuggestBookQuery] = useState('');
  const [suggestBookResults, setSuggestBookResults] = useState([]);
  const [isSuggestingBook, setIsSuggestingBook] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // console.log("userData-------",  userData);
  

  useEffect(() => {
    const fetchFriendDetails = async () => {
      try {
        const details = await getFriendDetails(friendId);
        setFriendDetails(details.friendProfile);
        setBooks(details.detailedBooks);
        const sortedComments = details.friendProfile?.comments.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        ) || [];
        setComments(sortedComments);
        console.log("friendDetails---------", details.friendProfile, comments);
        
      } catch (error) {
        console.error('Error fetching friend details:', error);
      }
    };
  
    fetchFriendDetails();
    setFilter('all');
  }, [friendId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const commentData = { commenterId: userData.id, friendId, text: newComment }; 
      const response = await postComment(commentData);
        
      if (response && response.commentsWithUsernames) {
        const sortedComments = response.commentsWithUsernames.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        ) || [];
        setComments(sortedComments); // Replace entire comments array with the updated one
      } else {
        // Fallback: optimistically add the new comment
        const newCommentAdded = {
          _id: Date.now(), // Temporary ID, can be replaced with actual ID from backend
          commenter: userData._id,
          commenterUsername: userData.username,
          content: newComment,
          createdAt: new Date().toISOString(), // Assuming server returns ISO dates
        };
        setComments(prevComments => [...prevComments, newCommentAdded]);
      }
      
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    try {
      // Call the API to delete the comment
      await deleteCommentByCommenter({ userId: userData.id, commentId });  // Assuming deleteComment function makes a request to the backend API
  
      // Optimistically update the UI by removing the deleted comment from the state
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Optionally: Handle error or revert the UI
    }
  };
  

  const handleSuggestBookSearch = async () => {
    try {
      const results = await searchBooks(suggestBookQuery);
      setSuggestBookResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleSuggestBook = async (book) => {
    try {
      const bookLink = `/books/${book.id}`;
      const commentText = `I suggest you read [${book.volumeInfo.title}](${bookLink})`;

      const commentData = { 
        commenterId: userData.id, 
        friendId: friendId, 
        text: commentText 
      };

      await postComment(commentData);

      setComments(prevComments => [...prevComments, { 
        commenterUsername: userData.username, 
        content: commentText 
      }]);

      setSuggestBookQuery('');
      setSuggestBookResults([]);
      setIsSuggestingBook(false);

    } catch (error) {
      console.error('Error suggesting book:', error);
    }
  };

  const handleAddBookToMyCollection = async (book) => {
    try {
      const addedBook = await addBookFromSearch({
        title: book.title,
        author: book.author,
        description: book.description,
        thumbnail: book.thumbnail,
        averageRating: book.averageRating || null,
        pageCount: book.pageCount || null,
      }, userData.id);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      console.log('Book added to your collection:', addedBook);
    } catch (error) {
      console.error('Error adding book to collection:', error);
    }
  };

  const handleClearSearch = () => {
    setSuggestBookQuery('');
    setSuggestBookResults([]);
    setIsSuggestingBook(false);
  };

  if (!friendDetails) {
    return <p>Loading friend details...</p>;
  }

  return (
    <div className='friend-profile'>
      <div className='profile-header'>
        <p className='name'><strong>{friendDetails.username}'s Profile </strong></p>
        <p className='email'>{friendDetails.email}</p>
      </div>
      
      <div className="filter-buttons">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          All Books
        </button>
        <button
          onClick={() => setFilter('currently-reading')}
          className={filter === 'currently-reading' ? 'active' : ''}
        >
          Currently Reading
        </button>
        <button
          onClick={() => setFilter('read')}
          className={filter === 'read' ? 'active' : ''}
        >
          Finished Reading
        </button>
      </div>

      <div className='book-grid'>
        {books.length > 0 ? (
          books.filter(book => {
            if (filter === 'all') return true;
            return book.status === filter;
          }).map(book => (
            <div key={book._id} className='book'>
              {book.thumbnail ? (
                <img src={book.thumbnail} alt={book.title} />
              ) : (
                <img src="/book_thumbnail.jpg" alt={book.title} />
              )}
              <div className='details'>
                <div className='title-author'>
                  <p className=' title no-margin '>{book.title}</p>
                  <p className='author no-margin'>by {book.author}</p>
                </div>
                
                <div className="book-actions">
                  {book.status === 'currently-reading' ? (
                    <p className='no-margin'>Currently Reading</p>
                  ) : book.status === 'read' ? (
                    <p>Finished Reading!</p>
                  ) : (
                    <></>
                  )}
                  {/* Add to My Collection Button */}
                  <button className='add-to-collection' onClick={() => handleAddBookToMyCollection(book)}>Add to My Collection</button>
                  {showNotification && (
                    <Notification
                      message="Book added to your collection!"
                      onClose={() => setShowNotification(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No books added yet.</p>
        )}
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        <div className='comments-list'>
          {comments.length > 0 ? (
            <ul>
              {comments.map((comment) => (
                <li id={comment._id} className='comment'>
                  <p className='commenter-name'>{comment.commenterUsername == userData.username ? 'You' : comment.commenterUsername}</p>
                  <div className='comment-content'>
                    <p>{comment.content}</p>
                    {/* Allow the commenter to delete their comment */}
                    {comment.commenter === userData.id && (
                      <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Comments Yet!</p>
          )}
        </div>


        {/* Suggest a Book Section */}
        {isSuggestingBook && (
          <div className="suggest-book-section">
            <input
              type="text"
              value={suggestBookQuery}
              onChange={(e) => setSuggestBookQuery(e.target.value)}
              placeholder="Search for books to suggest..."
            />
            <button onClick={handleSuggestBookSearch}>Search</button>

            {suggestBookResults.length > 0 && (
              <div className="search-results">
                <div className="search-results-header">
                  <h3>Search Results</h3>
                  <button className="close-button" onClick={handleClearSearch}>X</button>
                </div>
                {suggestBookResults.map(book => (
                  <div key={book.id} className="book-card">
                    <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} />
                    <p>{book.volumeInfo.title}</p>
                    <button onClick={() => handleSuggestBook(book)}>Suggest this Book</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Comment Form */}
        <form className='comment-form' onSubmit={handleCommentSubmit}>
          <textarea className='comment-text'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Leave a comment..."
            rows="3"
            required
          />
          <button type="submit">Post Comment</button>
          <button type="button" onClick={() => setIsSuggestingBook(!isSuggestingBook)}>Suggest a Book</button>
        </form>
      </div>
    </div>
  );
};

export default FriendProfile;
