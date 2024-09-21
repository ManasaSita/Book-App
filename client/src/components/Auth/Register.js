import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register } from '../../services/api'; // Ensure the register function is correctly imported from your API file

const Register = ({ onRegisterSuccess }) => {
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: authenticateUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const userData = {username: username, email: email, password: password};
    // console.log("username, email, password---", userData);
    
    try {
      const response = await register(userData);
      // console.log("response------", response);
      
      // Assuming the backend returns a token on successful registration
      authenticateUser(response);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <p className='app-name'>BookShlef</p>
      <p className='login'>Register</p>
      <form onSubmit={handleSubmit}>
          <label htmlFor="username">Name:</label>
          <input type="text" id="username" value={username} onChange={(e) => setName(e.target.value)} required/>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        {error && <p className="error">{error}</p>}
        <button type="submit">Register</button>
        <p>Don't have an account? <Link to="/login">Login Here!</Link></p>
      </form>
    </div>
  );
};

export default Register;
