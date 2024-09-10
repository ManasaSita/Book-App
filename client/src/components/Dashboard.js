import React, { useState, useEffect } from 'react';
import { updateBookProgress, updateBookStatus, getCurrentlyReadingBooks } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [pagesRead, setPagesRead] = useState('');
  const [bookIdToUpdate, setBookIdToUpdate] = useState(null);
  const [totalPagesToUpdate, setTotalPagesToUpdate] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const userId = user.payload.user.id;
  console.log("User----", userId);

  useEffect(() => {
    fetchCurrentlyReading();
  }, []);

  const fetchCurrentlyReading = async () => {
    try {
      const books = await getCurrentlyReadingBooks(userId);
      console.log("Books======", books);
      setCurrentlyReading(books);
    } catch (error) {
      console.error('Error fetching currently reading books:', error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page
    
    try {
      console.log("updateBookProgress-------", bookIdToUpdate, totalPagesToUpdate, pagesRead, userId);
      
      // Calculate progress as a percentage and ensure it's capped at 100
      const progress = Math.min(Math.round((Number(pagesRead) / totalPagesToUpdate) * 100), 100);
      console.log("progress---", progress);

      // Call API to update progress
      await updateBookProgress({userId, bookId:bookIdToUpdate, progress, pagesRead});

      // Update the local state with the new progress
      setCurrentlyReading(currentlyReading.map(book =>
        book._id === bookIdToUpdate ? { ...book, progress: progress } : book
      ));

      // Hide the input field after updating
      setIsUpdating(false);
      setPagesRead(''); // Clear the input field after submit

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

  return (
    <div className='dashboard'>
      <h3>Currently Reading</h3> 
      <div className="book-grid">
        {currentlyReading.length > 0 ? (
          currentlyReading.map(book => (
            
              <div className='book' id={book._id}>
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
                        <input type="number" value={book.pagesRead} onChange={(e) => setPagesRead(e.target.value)} min="0" max={book.pageCount}/>
                        <p> / {book.pageCount}</p>
                      </div>
                      
                      <button type="submit">Update Progress</button>
                    </form>
                  ) : (
                    <div className='progress'>
                      <div className='percent'>Progress: {book.progress}%</div>
                      <button onClick={() => handleUpdateClick(book._id, book.pageCount)}> Update Progress</button>
                      <button onClick={() => handleFinishBook(book._id)}>I've finished</button>
                    </div>
                  )}
                </div>

              </div>
          ))
        ) : (
          <div>
            <p>No book is marked as Reading. Start reading...!</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
