import React from 'react';

const Notification = ({ message, onClose }) => {
  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-box" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={onClose}>&times;</span>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Notification;
