import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, fetchMessages } from '../services/api';
import { useParams } from 'react-router-dom';

const Chat = ({ friend }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const senderId = useParams().userId;
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const fetchedMessages = await fetchMessages(senderId, friend._id);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    loadMessages();
  }, [friend._id, senderId]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const messageData = { senderId: senderId, friendId: friend._id, content: newMessage };
      const sentMessage = await sendMessage(messageData);
      setMessages([...messages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-container">
      <h2>Chat with {friend.username}</h2>
      <div className="messages-wrapper">
        <div className="messages">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.sender === senderId ? 'sent' : 'received'}`}
              >
                {/* <strong>
                  {message.sender === senderId ? sender : friend.username}:
                </strong> */}
                <span className="message-content">{message.content}</span>
              </div>
            ))
          ) : (
            <div className="no-messages">
              <p>Send Hi..!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSendMessage} className="send-message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;