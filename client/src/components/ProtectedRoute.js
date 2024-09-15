import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (user === undefined) {
    // Still determining auth state
    return <div>Loading...</div>;
  }

  if (user === null) {
    return <Navigate to="/login" />;
  }

  // Clone the children and pass userId as a prop
  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      console.log("React.cloneElement(child, { userId: user.id })----", React.cloneElement(child, { userId: user.payload.user.id }));
      
      return React.cloneElement(child, { userId: user.payload.user.id });
    }
    return child;
  });
};

export default ProtectedRoute;