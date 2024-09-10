import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  const [userData, setUserData] = useState(user?.payload?.user);
  const [notifications, setNotifications] = useState([
    // Sample notifications; replace with dynamic data
    { id: 1, message: 'Friend commented on your post', content: 'Comment Content 1' },
    { id: 2, message: 'New friend request', content: 'Friend Request Content' },
  ]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  return (
    <div className="profile-page">
      <div className="left-side">
        <div className="notifications">
          <h3>Notifications</h3>
          {notifications.map(notification => (
            <div key={notification.id} onClick={() => handleNotificationClick(notification)} className="notification-item">
              {notification.message}
            </div>
          ))}
        </div>
        <div className="user-profile">
          <h2>User Profile</h2>
          <p>Username: {userData.username}</p>
          <p>Email: {userData.email}</p>
          <button className='nav-link logout-btn' onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      <div className="right-side">
        {selectedNotification ? (
          <div className="notification-content">
            <h3>Notification Details</h3>
            <p>{selectedNotification.content}</p>
          </div>
        ) : (
          <p>Select a notification to view its content</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
