import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateBio, getDetails, getMyBooks } from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userId = user?.payload?.user.id;
  const [userData, setUserData] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [booksReadCount, setBooksReadCount] = useState(0);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, [userId]);

  const fetchBooks = async () => {
    try {
      const fetchedBooks = await getMyBooks(userId);
      setBooks(fetchedBooks);
      console.log(books);
      
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Calculate total books 
  const totalBooks = books.length;
  const totalBooksRead = books.filter(book => book.status === 'read').length;
 // New state for the number of books read

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await getDetails(userId);
        setUserData(response.user);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    getUser();
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditBioClick = () => {
    setIsEditing(true);
  };

  const handleBioSave = async () => {
    try {
      const response = await updateBio({ bio: userData.bio, user: user.payload.user });
      setUserData(response.userData);
      setIsEditing(false);
      alert('Bio updated successfully');
    } catch (error) {
      alert('Failed to update bio');
    }
  };

  const handleBioChange = (e) => {
    setUserData(prevData => ({ ...prevData, bio: e.target.value }));
  };

  // Callback to receive the number of books read from BookList
  const handleBooksReadUpdate = (count) => {
    setBooksReadCount(count);
  };

  return (
    <div className="profile-page">
      <div className='left-side'>
        <div className="user-profile">
          <ul>
            <li>
              <p>Username: <strong>{userData.username}</strong></p>
            </li>
            <li>
              <p>Email: {userData.email}</p>
            </li>
            <li>
              <label>Bio</label>
              {!isEditing ? (
                <>
                  <p>{userData.bio}</p>
                  <button className='edit-btn' onClick={handleEditBioClick}>Edit</button>
                </>
              ) : (
                <>
                  <input
                    id='bio'
                    type='text'
                    value={userData.bio}
                    onChange={handleBioChange}
                  />
                  <button className='save-btn' onClick={handleBioSave}>Save</button>
                </>
              )}
            </li>
            <li>
              <p>Total Books Read: <strong>{totalBooks}</strong></p> {/* Display the books read count */}
            </li>
          </ul>
          <button className='nav-link logout-btn' onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className='right-side'>
        {/* Pass the handleBooksReadUpdate callback to BookList */}
        <h2>Books Summary</h2>
        <p>Total Books Read: {totalBooksRead}</p>
        {books.length > 0 ? (
          <div className="book-grid">
            {books.map(book => (
              <div key={book._id} className="book-card">
                <img src={book.thumbnail}/>
                <h4>{book.title}</h4>
                <p>Author: {book.author}</p>
                <p>Status: {book.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No books added yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
