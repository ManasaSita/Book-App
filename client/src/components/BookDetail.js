import React, { useState, useEffect } from 'react';
import { getBookWithStatus, addReview, getReviews, editReview, deleteReview, getBook, addBookFromSearch } from '../services/api'; // addToCollection method
import { useParams, Link, useLocation } from 'react-router-dom';
import Notification from './Notification';

const BookDetail = () => {
  const [book, setBook] = useState(null);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState(null); // Track the review being edited
  const { bookId } = useParams();
  const location = useLocation();
  const [showNotification, setShowNotification] = useState(false);
  const userId = useParams().userId;
  console.log("params-------", useParams(), userId);

  useEffect(() => {
    // Determine which fetch method to use based on the URL
    if (location.pathname.includes('suggested')) {
      fetchSuggestedBook();
    } else {
      fetchBookWithStatus();
    }
    fetchReview();
  }, [bookId, location.pathname]);

  const fetchBookWithStatus = async () => {
    try {
      const fetchedBook = await getBookWithStatus(bookId, userId);
      setBook(fetchedBook);
      setReviewText(fetchedBook.review || '');
      setReviewToEdit(fetchedBook.review || '');
    } catch (error) {
      console.error('Error fetching book with status:', error);
    }
  };

  const fetchSuggestedBook = async () => {
    try {
      const suggestedBook = await getBook(bookId);
      const bookDetails = {
        title: suggestedBook.title,
        author: suggestedBook.authors ? suggestedBook.authors.join(', ') : 'Unknown',
        description: suggestedBook.description,
        thumbnail: suggestedBook ? suggestedBook.thumbnail : null,
        averageRating: suggestedBook.averageRating || null,
        pageCount: suggestedBook.pageCount || null,
      };
      setBook(bookDetails);
    } catch (error) {
      console.error('Error fetching suggested book:', error);
    }
  };

  const fetchReview = async () => {
    await getReviews(bookId);
  }

  const handleReviewChange = (e) => {
    setReviewText(e.target.value);
  };

  const handleAddReview = async () => {
    try {
      await addReview(userId, bookId, reviewText);
      setReviewText('');
      setIsAddingReview(false);
      fetchBookWithStatus();
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const handleEditReview = async () => {
    try {
      await editReview(userId, bookId, reviewText);
      setIsEditing(false);
      setReviewToEdit(reviewText);
      fetchBookWithStatus();
    } catch (error) {
      console.error('Error editing review:', error);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReview(userId, bookId);
      setReviewText('');
      setReviewToEdit('');
      fetchBookWithStatus();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const handleAddToCollection = async () => {
    try {
      await addBookFromSearch(book, userId);
      setShowNotification(true);
    } catch (error) {
      console.error('Error adding book to collection:', error);
    }
  };

  if (!book) return <div>Loading...</div>;

  const description = book.description || '';
  const maxLength = 250;
  const isTruncated = description.length > maxLength;
  const displayText = showMore ? description : `${description.substring(0, maxLength)}...`;

  return (
    <div className='book-detail'>
      <div className='book-content'>
        <div className='image'>
          <img src={book.thumbnail} alt={book.title} />
        </div>
        <div className='content'>
          <h2>{book.title}</h2>
          <p>Author: {book.author}</p>
          <div className="description-box">
            Description:
            <p className='description'>{displayText}</p>
            {isTruncated && (
              <button onClick={toggleShowMore}>
                {showMore ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
          <p>Rating: {book.averageRating}</p>
          <p>Page Count: {book.pageCount}</p>
          {location.pathname.includes('suggested') ? null : (
            <>
              <p>Status: {book.status}</p>

              {reviewToEdit ? (
                <div className="review-container">
                  {isEditing ? (
                    <div>
                      <input
                        type='text'
                        placeholder="Edit your review"
                        value={reviewText}
                        onChange={handleReviewChange}
                      />
                      <button onClick={handleEditReview}>Save Review</button>
                      <button onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  ) : (
                    <div>
                      <h3>Your Review:</h3>
                      <p>{reviewToEdit}</p>
                      <button onClick={() => setIsEditing(true)}>Edit Review</button>
                      <button onClick={handleDeleteReview}>Delete Review</button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {isAddingReview ? (
                    <div>
                      <input
                        type='text'
                        placeholder="Add your review"
                        value={reviewText}
                        onChange={handleReviewChange}
                      />
                      <button onClick={handleAddReview}>Add Review</button>
                      <button onClick={() => setIsAddingReview(false)}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setIsAddingReview(true)}>Add Review</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {location.pathname.includes('suggested') ? (
        <>
          <button onClick={handleAddToCollection}>Add to Collection</button>
          {showNotification && (
            <Notification
              message="Book added to your collection!"
              onClose={() => setShowNotification(false)}
            />
          )}
        </>
      ) : (
        <Link to={`/user/${userId}/mybooks`}>
          <button>Back to List</button>
        </Link>
      )}
    </div>
  );
};

export default BookDetail;
