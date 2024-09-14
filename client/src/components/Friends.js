// Friends.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFriends, searchUsers, sendFriendRequest, fetchFriendRequests, respondToFriendRequest } from '../services/api';
import FriendProfile from './FriendProfile';
import Notification from './Notification';

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [requests, setRequests] = useState([]);
  const senderId = useAuth().user.payload.user.id;
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      const response = await fetchFriends(senderId);
      setFriends(response);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetchFriendRequests();
      setRequests(response.receivedRequests);
      console.log("fetchRequests--------", requests);
      
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await searchUsers(searchTerm);
      setSearchResults(response);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      await sendFriendRequest(receiverId, senderId);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

    const handleResponse = async (request, action) => {
    try {
      console.log("handleResponse-----", request, action);
      
      await respondToFriendRequest(request.sender._id, request._id, action);
      setRequests(requests.filter(request => request._id !== request._id));
      fetchFriendsData();
    } catch (error) {
      console.error(`Error ${action === 'accept' ? 'accepting' : 'declining'} friend request:`, error);
    }
  };

  const handleFriendClick = (friendId) => {
    setSelectedFriendId(friendId);
  };

  return (
    <div className="friends-container">
      <div className="friends-list">
        <form onSubmit={handleSearch} className='search-container-friend'>
          <input
            type="text"
            placeholder="Search for users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {requests ? (
          <div className='friend-request'>
            <h3>Friend Requests</h3>
            <ul className='request-list'>
              {requests.map(request => (
              <li id={request._id} className='request'>
                <p>{request.sender.username}</p>
                <button className='accept' onClick={() => handleResponse(request, 'accept')}>&#10004;</button>
                <button className='decline' onClick={() => handleResponse(request, 'decline')}>&#10008;</button>
              </li>
              ))}
            </ul>
          </div>
        ) : (
          <></>
        )}
        
        {searchResults && searchResults.length > 0 ? (
          <>
            <h2>Search Results</h2>
            <ul>
              {searchResults.map(user => (
                <li key={user._id}>
                  {user.username}
                  <button onClick={() => handleSendRequest(user._id)}>Add Friend</button>
                  {showNotification && (
                    <Notification
                      message="Friend Request sent!"
                      onClose={() => setShowNotification(false)}
                    />
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <></>
          // <p>No results found.</p>
        )}

        <h1>Your Friends</h1>
        <ul>
          {friends.map(friend => (
            <li
              key={friend._id}
              onClick={() => handleFriendClick(friend._id)}
              className={friend._id === selectedFriendId ? 'selected-friend' : ''}
            >
              {friend.username}
            </li>
          ))}
        </ul>
      </div>
      <div className="friend-profile-or-chat">
        {selectedFriendId ? (
          <FriendProfile friendId={selectedFriendId} />
        ) : (
          <p>Select a friend to view their profile</p>
        )}
      </div>
    </div>
  );
};

export default Friends;
