import React, {useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import Profile from './components/Profile';
import Friends from './components/Friends';
import FriendProfile from './components/FriendProfile';
import { AuthProvider, useAuth } from './context/AuthContext';
import Notification from './components/Notification';
import ChatPage from './components/ChatPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, initAuth } = useAuth();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (user === undefined) {
    // Still determining auth state
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/user/${user.id}/dashboard`} /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/user/:userId" element={<Layout />}>
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="mybooks" element={<ProtectedRoute><BookList /></ProtectedRoute>} />
        <Route path="books/:bookId" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
        <Route path="books/suggested/:bookId" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
        <Route path="friends/:id" element={<ProtectedRoute><FriendProfile /></ProtectedRoute>} />
        <Route path="friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="friends/messages" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Route>
    </Routes>
  );
}

export default App;
