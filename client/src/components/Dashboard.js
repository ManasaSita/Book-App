import React, { useState, useEffect } from 'react';
import { updateBookProgress, updateBookStatus, getCurrentlyReadingBooks, getComments, deleteComment } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [pagesRead, setPagesRead] = useState('');
  const [bookIdToUpdate, setBookIdToUpdate] = useState(null);
  const [totalPagesToUpdate, setTotalPagesToUpdate] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeView, setActiveView] = useState('currentlyReading');
  const [comments, setComments] = useState([]);
  const { user } = useAuth();
  const userId = user.payload.user.id;

  useEffect(() => {
    fetchCurrentlyReading();
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await getComments(userId);
      console.log("comments---", response);
      setComments(response)
    } catch (error) {
      console.error('Error fetching comments:', error.message);
    }
  };

  const fetchCurrentlyReading = async () => {
    try {
      const books = await getCurrentlyReadingBooks(userId);
      setCurrentlyReading(books);
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
    try {
      // Optimistically update the UI
      await deleteComment({userId, commentId});
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));  
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Optionally: Revert UI if deletion fails (not implemented here)
    }
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
            comments
          </li>
        </ul>
      </div>
      <div className="right-side">
        {activeView === 'currentlyReading' ? (
          <div>
            <h3>Currently Reading</h3>
            <div className="book-grid">
              {currentlyReading ? (
                currentlyReading.map(book => (
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
                ))
              ) : (
                <p>No book is marked as Reading. Start reading...!</p>
              )}
            </div>
          </div>
        ) : (
          <div className="comments">
            <h3>comments</h3>
            {comments.map(comment => (
              <div key={comment.id} className="comments-item">
                <p className='commenter'><strong>{comment.commenterUsername}</strong></p>
                <p className='content'>{comment.content}</p>
                <button onClick={() => handleDeleteComment(comment.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;