import React, { useState, useEffect } from 'react';
import { getMyBooks, deleteBook, searchBooks, addBookFromSearch, updateBookStatus, inMyCollection } from '../services/api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import NoDataPage from './NoDataPage';
import Notification from './Notification';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false); // Track if search has been performed
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const userId = useParams().userId;
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [userId]);

  useEffect(() => {
    setFilter('all');
  }, [userId]);

  const fetchBooks = async () => {
    try {
      const fetchedBooks = await getMyBooks(userId);
      setBooks(fetchedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setSearchPerformed(true);  
      const results = await searchBooks(searchQuery, userId);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleAddBook = async (book) => {
    try {
      const addedBook = await addBookFromSearch({
        googleBooksId: book.id,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown',
        description: book.volumeInfo.description,
        thumbnail: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : null,
        averageRating: book.volumeInfo.averageRating ? book.volumeInfo.averageRating : null,
        pageCount: book.volumeInfo.pageCount,
      }, userId);
  
      fetchBooks();
      setSearchResults([]);
      setSearchQuery('');
      setSearchPerformed(false);
      setNotification({ message: 'Book added successfully', type: 'success' });
      setTimeout(() => setNotification(false), 3000);
    } catch (error) {
      console.error('Error adding book:', error);
      if (error.response && error.response.data.message === 'This book is already in your collection') {
        setNotification({ message: error.response.data.message, type: 'warning' });
        setTimeout(() => setNotification(false), 3000);
      } else {
        setNotification({ message: 'Failed to add book', type: 'error' });
        setTimeout(() => setNotification(false), 3000);
      }
    }
  };

  const handleMarkAsReading = async (bookId) => {
    try {
      await updateBookStatus(userId, bookId, 'currently-reading');
      fetchBooks();
    } catch (error) {
      console.error('Error marking book as currently reading:', error);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      await deleteBook(id);
      setBooks(books.filter(book => book._id !== id));
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchPerformed(false); // Reset searchPerformed when clearing the search
  };

  const filteredBooks = books.filter(book => {
    if (filter === 'all') return true;
    return book.status === filter;
  });

  return (
    <div className="book-list-container">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="search-container">
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for books"/>
        <button type='submit' onClick={handleSearch}>Search</button>
      </div>

      {searchResults && searchResults.length > 0 ? (
        <div className="search-results">
          <div className="search-results-header">
            <h3>Search Results</h3>
            <button className="close-button" onClick={handleClearSearch}>X</button>
          </div>
          <div className="book-grid">
            {searchResults.map(book => (
              <div key={book.id} className="book-card">
                <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} />
                <h4>{book.volumeInfo.title}</h4>
                <p>by {book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown'}</p>
                <button onClick={() => handleAddBook(book)}>Add to My Books</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {books && books.length > 0 ? (
            <>
              <h2>My Books</h2>
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

              <div className="book-grid">
                {filteredBooks.map(book => (
                  <div id={book._id} className="book-card">
                    {book.thumbnail ? (
                      <img src={book.thumbnail} alt={book.title} />
                    ) : (
                      <img src="book_thumbnail.jpg" alt={book.title} />
                    )}
                    <h3 className='no-margin'>{book.title}</h3>
                    <p className='no-margin'>by {book.author}</p>
                    
                    <div className="book-actions">
                      {book.status === 'currently-reading' ? (
                        <p>Currently Reading</p>
                      ) : book.status === 'read' ? (
                        <p>Finished Reading!</p>
                      ) : (
                        <button onClick={() => handleMarkAsReading(book._id)}>Mark as Currently Reading</button>
                      )}
                      <Link to={`/user/${userId}/books/${book._id}`}>
                        <button>View</button>
                      </Link>
                      <button onClick={() => handleDeleteBook(book._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            !searchPerformed && <NoDataPage message="Add a BOOK!" />
          )}
        </>
      )}
    </div>
  );
};

export default BookList;
