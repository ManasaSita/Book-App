import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api'; // Ensure the login function is correctly imported from your API file

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login: authenticateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(email, password);
      authenticateUser(userData);
      console.log("userData--------",  userData);
      const userId =  userData.payload.user.id;
      
      navigate(`/user/${userId}/dashboard`);  // Redirect to the homepage or dashboard after successful login
    } catch (err) {
      console.error('Login failed', err);
      setError('Invalid email or password');
    }
  };


  return (
    <div className="login-page">
      <p className='app-name'>BookShlef</p>
      <p className='login'>Login</p>
      <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
        <p>Don't have an account? <Link  to="/register">Register Here!</Link></p>
      </form>
    </div>
  );
};

export default Login;
