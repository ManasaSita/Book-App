import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFriendDetails, postComment, deleteCommentByCommenter, searchBooks, addBookFromSearch, createBook } from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import Notification from './Notification';

const FriendProfile = ({ friendId }) => {
  const { user } = useAuth(); 
  const userData= user?.payload?.user;
  const userId = useParams().userId;
  const [friendDetails, setFriendDetails] = useState(null);
  const [books, setBooks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [filter, setFilter] = useState('all');
  const [suggestBookQuery, setSuggestBookQuery] = useState('');
  const [suggestBookResults, setSuggestBookResults] = useState([]);
  const [isSuggestingBook, setIsSuggestingBook] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isBookSearchOpen, setIsBookSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedBook, setSuggestedBook] = useState([]);

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
        // console.log("friendDetails---------", details.friendProfile, comments);
        
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
      const commentData = { commenterId: userId, friendId, text: newComment }; 
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
          commenter: userId,
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
      await deleteCommentByCommenter({ userId: userId, commentId });  // Assuming deleteComment function makes a request to the backend API
  
      // Optimistically update the UI by removing the deleted comment from the state
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Optionally: Handle error or revert the UI
    }
  };
  

  const handleOpenBookSearch = () => {
    setIsBookSearchOpen(true);
  };

  const handleCloseBookSearch = () => {
    setIsBookSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchBooks = async (e) => {
    e.preventDefault();
    try {
      const results = await searchBooks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleSuggestBook = async (book) => {
    try {
      const bookDetails = {
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown',
        description: book.volumeInfo.description,
        thumbnail: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : null,
        averageRating: book.volumeInfo.averageRating || null,
        pageCount: book.volumeInfo.pageCount || null,
        googleBooksId: book.id,
      };

      // Use the new suggestBook API endpoint
      const response = await postComment({
        commenterId: userId,
        friendId: friendId,
        bookDetails: bookDetails
      });

      if (response && response.message === 'Book suggested successfully') {
        const newComment = {
          _id: Date.now(), // Temporary ID
          commenter: userId,
          commenterUsername: userData.username,
          content: `I suggest you read "${bookDetails.title}". Click here to see details:`,
          bookLink: response.bookId,
          createdAt: new Date().toISOString(),
        };
        setComments(prevComments => [...prevComments, newComment]);
      }

      handleCloseBookSearch();
    } catch (error) {
      console.error('Error suggesting book:', error);
    }
  };

  const renderCommentContent = (comment) => {
    const suggestPattern = /I suggest you read "(.*?)"\. Click here to see details:/;
    const match = comment.content.match(suggestPattern);
    
    // console.log("suggestedbook", comment);
    
    if (match) {
      const bookTitle = match[1];
      return (
        <>
          I suggest you read "{' '}
          <Link 
            to={{
              pathname: `/user/${userId}/books/suggested/${comment.bookLink}`,
              state: { bookTitle: bookTitle }
            }}
          >
            {bookTitle}
          </Link>
          "
        </>
      );
    }
    return comment.content;
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
        googleBooksId: book.googleBooksId || null,
      }, userId);

      if(addedBook.status === 200) {
        setShowNotification({ message: 'Book added to your collection!', type: 'success' });
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      console.error('Error adding book to your collection:', error); 
      if (error.response && error.status === 409){
        setShowNotification({message:error.response.data.message, type: 'warning' }); 
        setTimeout(() => setShowNotification(false), 3000);
      } else { 
        setShowNotification({ message: 'Failed to add book to collection', type: 'error' });
        setTimeout(() => setShowNotification(false), 3000);
      }
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
      {showNotification && (
        <Notification
          message={showNotification.message}
          type={showNotification.type}
          onClose={() => setShowNotification(null)}
        />
      )}
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
                  {/* Add to My Collection Button */}
                  <button className='add-to-collection' onClick={() => handleAddBookToMyCollection(book)}>Add to My Collection</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className='no-books'>No books added yet.</p>
        )}
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        <div className='comments-list'>
          {comments.length > 0 ? (
            <ul>
              {comments.map((comment) => (
                <li key={comment._id} className='comment'>
                  <p className='commenter-name'>{comment.commenterUsername === userData.username ? 'You' : comment.commenterUsername}</p>
                  <div className='comment-content'>
                    <p>{renderCommentContent(comment)}</p>
                    {comment.commenter === userId && (
                      <button onClick={() => handleDeleteComment(comment._id)}>Delete</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className='no-comments'>No Comments Yet!</p>
          )}
        </div>

        {/* Book Search Pop-up */}
        {isBookSearchOpen && (
          <div className="book-search-popup">
            <div className="book-search-content">
              <div className='search-header'>
                <button className="close-button" onClick={handleCloseBookSearch}>X</button>
                <h3>Suggest a Book</h3>
              </div>
              <form onSubmit={handleSearchBooks}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for books..."
                />
                <button type="submit">Search</button>
              </form>
              <div className="book-grid">
                {searchResults.map(book => (
                  <div key={book.id} className="book">
                    <img 
                      src={book.volumeInfo.imageLinks?.thumbnail || "/book_thumbnail.jpg"} 
                      alt={book.volumeInfo.title} 
                    />
                    <div className="details">
                      <div className='title-author'>
                        <p className="title no-margin ">{book.volumeInfo.title}</p>
                        <p className="author no-margin ">by {book.volumeInfo.authors?.join(', ') || 'Unknown'}</p>
                      </div>
                      <div className="book-actions">
                        <button type='submit' onClick={() => handleSuggestBook(book)}>Suggest this Book</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Comment Form */}
        <form className='comment-form' onSubmit={handleCommentSubmit}>
          <textarea
            className='comment-text'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Leave a comment..."
            rows="3"
            required
          />
          <button type="submit">Post Comment</button>
          <button type="button" onClick={handleOpenBookSearch}>Suggest a Book</button>
        </form>
      </div>
    </div>
  );
};

export default FriendProfile;
