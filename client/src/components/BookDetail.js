import React, { useState, useEffect } from 'react';
import { getBookWithStatus, addReview, getReviews, editReview, deleteReview } from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BookDetail = () => {
  const [book, setBook] = useState(null);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState(null); // Track the review being edited
  const { bookId } = useParams();
  const { user } = useAuth();
  const userId = user.payload.user.id;

  useEffect(() => {
    fetchBook();
    fetchReview();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const fetchedBook = await getBookWithStatus(bookId, userId);
      setBook(fetchedBook);
      setReviewText(fetchedBook.review || '');
      setReviewToEdit(fetchedBook.review || '');
    } catch (error) {
      console.error('Error fetching book:', error);
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
      fetchBook();
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const handleEditReview = async () => {
    try {
      await editReview(userId, bookId, reviewText);
      setIsEditing(false);
      setReviewToEdit(reviewText);
      fetchBook();
    } catch (error) {
      console.error('Error editing review:', error);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReview(userId, bookId);
      setReviewText('');
      setReviewToEdit('');
      fetchBook();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };
  
  const toggleShowMore = () => {
    setShowMore(!showMore);
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
              <button onClick={() => setShowMore(!showMore)}>
                {showMore ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
          
          <p>Rating: {book.rating}</p>
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
        </div>
      </div>

      <Link to="/books">
        <button>Back to List</button>
      </Link>
    </div>
  );
};

export default BookDetail;
