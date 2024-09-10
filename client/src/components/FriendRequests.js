// // components/FriendRequests.js
// import React, { useEffect, useState } from 'react';
// import { fetchFriendRequests, respondToFriendRequest } from '../services/api'; // Import the API calls

// const FriendRequests = () => {
//   const [requests, setRequests] = useState([]);

//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         const response = await fetchFriendRequests();
//         setRequests(response.receivedRequests);
//       } catch (error) {
//         console.error('Error fetching friend requests:', error);
//       }
//     };

//     fetchRequests();
//   }, []);

//   const handleResponse = async (requestId, action) => {
//     try {
//       await respondToFriendRequest(requestId, action);
//       setRequests(requests.filter(request => request._id !== requestId));
//     } catch (error) {
//       console.error(`Error ${action === 'accept' ? 'accepting' : 'declining'} friend request:`, error);
//     }
//   };

//   return (
//     <div>
//       <h3>Friend Requests</h3>
//       <ul>
//         {requests.map(request => (
//           <li key={request._id}>
//             {request.sender.username} ({request.sender.email})
//             <button onClick={() => handleResponse(request._id, 'accept')}>Accept</button>
//             <button onClick={() => handleResponse(request._id, 'decline')}>Decline</button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default FriendRequests;
