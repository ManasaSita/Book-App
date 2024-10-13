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
  const [books, setBooks] = useState([]);
  const [showBooks, setShowBooks] = useState(false);
  const [editedBio, setEditedBio] = useState('');

  useEffect(() => {
    fetchBooks();
    fetchUserDetails();
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

  const fetchUserDetails = async () => {
    try {
      const response = await getDetails(userId);
      setUserData(response.user);
      setEditedBio(response.user.bio);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const totalBooks = books.length;
  const totalBooksRead = books.filter(book => book.status === 'read').length;
  const totalReadingBooks = books.filter(book => book.status === 'currently-reading').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditBioClick = () => {
    setIsEditing(true);
  };

  const handleBioSave = async () => {
    try {
      const response = await updateBio({ bio: editedBio, user: user.payload.user });
      setUserData(prevData => ({ ...prevData, bio: editedBio }));
      setIsEditing(false);
      alert('Bio updated successfully');
    } catch (error) {
      alert('Failed to update bio');
    }
  };

  const handleBioChange = (e) => {
    setEditedBio(e.target.value);
  };

  const toggleShowBooks = () => {
    setShowBooks(!showBooks);
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
              <p>Email: <strong>{userData.email}</strong></p>
            </li>
            <li>
              <label>Bio</label>
              <div className='bio-section'>
                <p className='bio-content'><strong>{userData.bio}</strong></p>
                {!isEditing && (
                  <button className='edit-btn' onClick={handleEditBioClick}>Edit Bio</button>
                )}
              </div>
            </li>
            <li className='book-collection'>
              <p>Collections: <strong>{totalBooks}</strong></p>
              <button className='toggle-books' onClick={toggleShowBooks}>
                {showBooks ? 'Hide Books' : 'Show Books'}
              </button>
            </li>
          </ul>
          <button className='nav-link logout-btn' onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className='right-side'>
        {isEditing && (
          <div className='bio-edit-section'>
            <input
              type='text'
              value={editedBio}
              onChange={handleBioChange}
              placeholder="Edit your bio"
              maxLength={120}
            />
            <button className='save-btn' onClick={handleBioSave}>Save</button>
          </div>
        )}
        {showBooks && (
          <div  className='books'>
            <h2 className='summary'>Books Summary</h2>
            <div className='book-totals'>
              <p><strong>Read:</strong> {totalBooksRead}</p> 
              <p><strong>Reading:</strong> {totalReadingBooks}</p>
            </div>
            {books.length > 0 ? (
              <div className="book-grid">
                {books.map(book => (
                  <div key={book._id} className="book-card">
                    <img src={book.thumbnail} alt={book.title} />
                    <div className='details'>
                      <h4>{book.title}</h4>
                      <p>Author: <strong>{book.author}</strong></p>
                      <p>Reading Status: <strong>{book.status}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No books added yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;