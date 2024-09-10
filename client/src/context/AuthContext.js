import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios'; // Make sure to install and import axios

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post('/api/auth/refresh-token', {}, {
        headers: {
          'x-auth-token': user.token
        }
      });
      const newUserData = { ...user, token: response.data.token };
      login(newUserData);
      return newUserData.token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
      return null;
    }
  }, [user, login, logout]);

  const handleExpiredToken = useCallback(async () => {
    const newToken = await refreshToken();
    if (newToken) {
      // Retry the original request with the new token
      // You'll need to implement this logic in your API calls
    } else {
      // Token refresh failed, redirect to login
      logout();
      // Redirect to login page
    }
  }, [refreshToken, logout]);

  const initAuth = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, initAuth, handleExpiredToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);