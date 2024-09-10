import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFriends } from '../services/api';
import Chat from './Chat';  // Import the Chat component
import Notification from './Notification';

const ChatPage = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const senderId = useAuth().user.payload.user.id;
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        const response = await fetchFriends(senderId);
        setFriends(response);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriendsData();
  }, []);

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
    setIsChatOpen(true);
  };

  return (
    <div className="friends-container">
      <div className="friends-list">
        <h2>Friends List</h2>
        <ul>
          {friends.map(friend => (
            <li
              key={friend._id}
              onClick={() => handleFriendClick(friend)}
              className={friend === selectedFriend ? 'selected-friend' : ''}
            >
              {friend.username}
            </li>
          ))}
        </ul>
      </div>

      <div className="friend-profile-or-chat">
        {isChatOpen ? (
          <Chat friend={selectedFriend} />
        ) : (
          <p>Select a friend to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
