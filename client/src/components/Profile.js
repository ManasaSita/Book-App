import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  const userData = user?.payload?.user;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <div className="user-profile">
        <h2>Your Profile</h2>
        <p>Username: {userData.username}</p>
        <p>Email: {userData.email}</p>
        <button className='nav-link logout-btn' onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Profile;