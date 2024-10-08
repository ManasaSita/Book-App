import React, { useState, useEffect } from 'react';
import { updateBookProgress, updateBookStatus, getCurrentlyReadingBooks, getComments, deleteCommentByTargetUser } from '../services/api';
import { Link, useParams } from 'react-router-dom';
import NoDataPage from './NoDataPage';

const Dashboard = () => {
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [pagesRead, setPagesRead] = useState('');
  const [bookIdToUpdate, setBookIdToUpdate] = useState(null);
  const [totalPagesToUpdate, setTotalPagesToUpdate] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeView, setActiveView] = useState('currentlyReading');
  const [comments, setComments] = useState([]);
  const userId = useParams().userId;

  // console.log("params-------", useParams(), userId);
  
  useEffect(() => {
    fetchCurrentlyReading();
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await getComments(userId);
      // console.log("comments---", response);
      setComments(response)
    } catch (error) {
      console.error('Error fetching comments:', error.message);
    }
  };

  const fetchCurrentlyReading = async () => {
    try {
      const books = await getCurrentlyReadingBooks(userId);
      // console.log("books--------", books);

      if(books.message){
        setCurrentlyReading([]);
      } else {
        setCurrentlyReading(books);
      }
    } catch (error) {
      console.error('Error fetching currently reading books:', error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const progress = Math.min(Math.round((Number(pagesRead) / totalPagesToUpdate) * 100), 100);
      await updateBookProgress({userId, bookId:bookIdToUpdate, progress, pagesRead});
      setCurrentlyReading(currentlyReading.map(book =>
        book._id === bookIdToUpdate ? { ...book, progress: progress } : book
      ));
      setIsUpdating(false);
      setPagesRead('');
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleFinishBook = async (bookId) => {
    try {
      await updateBookStatus(userId, bookId, 'read');
      setCurrentlyReading(currentlyReading.filter(book => book._id !== bookId));
    } catch (error) {
      console.error('Error finishing book:', error);
    }
  };

  const handleUpdateClick = (bookId, totalPages) => {
    setBookIdToUpdate(bookId);
    setTotalPagesToUpdate(totalPages);
    setIsUpdating(true);
  };

  const handleDeleteComment = async (commentId) => {
    // console.log("handleDeleteComment--------", commentId, userId);
    
    try {
      // Call the API to delete the comment
      await deleteCommentByTargetUser({ userId, commentId });  // Assuming deleteComment function makes a request to the backend API
  
      // Optimistically update the UI by removing the deleted comment from the state
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Optionally: Handle error or revert the UI
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

  return (
    <div className='dashboard'>
      <div className="left-side">
        <ul>
          <li 
            onClick={() => setActiveView('currentlyReading')} 
            className={activeView === 'currentlyReading' ? 'active' : ''}>
              Currently Reading
          </li>
          <li 
            onClick={() => setActiveView('comments')} 
            className={activeView === 'comments' ? 'active' : ''}>
            Comments
          </li>
        </ul>
      </div>
      <div className="right-side">
        {activeView === 'currentlyReading' ? (
          <div>
            {currentlyReading && currentlyReading.length > 0 ? (
              <>
                <h3>Currently Reading</h3>
                <div className="book-grid">
                  {currentlyReading.map(book => (
                      <div className='book' key={book._id}>
                        <img src={book.thumbnail} alt={book.title} />
                        <div className='details'>
                          <div className='title-author'>
                            <p className='title'>{book.title}</p>
                            <p className='author'>by <strong>{book.author}</strong></p>
                          </div>
                          {isUpdating && bookIdToUpdate === book._id ? (
                            <form onSubmit={handleSubmit}>
                              Pages Read:
                              <div className='input-calc'>
                                <input 
                                  type="number" 
                                  value={pagesRead} 
                                  onChange={(e) => setPagesRead(e.target.value)} 
                                  min="0" 
                                  max={book.pageCount}
                                />
                                <p> / {book.pageCount}</p>
                              </div>
                              <button type="submit">Update Progress</button>
                            </form>
                          ) : (
                            <div className='progress'>
                              <div className='percent'>Progress: {book.progress}%</div>
                              <button onClick={() => handleUpdateClick(book._id, book.pageCount)}>Update Progress</button>
                              <button onClick={() => handleFinishBook(book._id)}>I've finished</button>
                            </div>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </>
            ) : (
              <NoDataPage message="No book is marked as Reading. Start reading...!" link = {`/user/${userId}/mybooks`}/>
            )  }
          </div>
        ) : (
          <div className="comments">
              {comments.length > 0 ? (
                <div className='comments-list'>
                  <h3>Comments on Your Profile</h3>
                  <ul>
                    {comments.map((comment) => (
                      <li id={comment.id} className='comment'>
                        <p className='commenter'><strong>{comment.commenterUsername}</strong></p>
                        <div className='comment-content'>
                          <p>{renderCommentContent(comment)}</p>
                          <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <NoDataPage message="No Comments!" />
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
