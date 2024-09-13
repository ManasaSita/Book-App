import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedNav, setSelectedNav] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (location.pathname.includes('/friends/messages')) {
      setSelectedNav('chat');
    } else {
      const path = location.pathname.split('/')[1];
      if (['dashboard', 'mybooks', 'friends', 'profile'].includes(path)) {
        setSelectedNav(path);
      }
    }

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);  // Close dropdown after logging out
  };

  const toggleDropdown = () => {
    setSelectedNav('profile');
    setDropdownOpen(!isDropdownOpen);
  };

  const handleNavClick = (type) => {
    setSelectedNav(type);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className='app-container'>
      <div ref={dropdownRef}>
        {!isAuthPage && (
          <header className='navbar'>
            <div className='navbar-logo'>
              <Link to="/dashboard">BookShelf</Link>
            </div>
            <nav className='navbar-links'>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => handleNavClick('dashboard')}
                    className={selectedNav === 'dashboard' ? 'selected-nav' : 'nav-link'}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/mybooks"
                    onClick={() => handleNavClick('mybooks')}
                    className={selectedNav === 'mybooks' ? 'selected-nav' : 'nav-link'}
                  >
                    My Books
                  </Link>
                  <Link
                    to="/friends"
                    onClick={() => handleNavClick('friends')}
                    className={selectedNav === 'friends' ? 'selected-nav' : 'nav-link'}
                  >
                    Friends
                  </Link>
                  <Link
                    to="/friends/messages"
                    onClick={() => handleNavClick('chat')}
                    className={selectedNav === 'chat' ? 'selected-nav' : 'nav-link'}
                  >
                    Chat
                  </Link>
                  <div className="profile-dropdown">
                    <div
                      onClick={toggleDropdown}
                      className={selectedNav === 'profile' ? 'selected-nav' : 'nav-link'}
                    >
                      Profile
                    </div>
                    {isDropdownOpen && (
                      <div className="dropdown-menu">
                        <Link 
                          to="/profile" 
                          className="dropdown-item" 
                          onClick={() => setDropdownOpen(false)}  // Close after selecting My Profile
                        >
                          My Profile
                        </Link>
                        <p 
                          onClick={handleLogout} 
                          className="dropdown-item no-margin"
                        >
                          Logout
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" className='nav-link'>Login</Link>
                  <Link to="/register" className='nav-link'>Register</Link>
                </>
              )}
            </nav>
          </header>
        )}
        <main className='main-content'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
