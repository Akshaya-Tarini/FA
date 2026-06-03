import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>PlacementHub</Link>
      </div>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <span style={{ color: 'var(--text-secondary)', marginRight: '1rem' }}>
              Welcome, {user?.email} ({user?.role})
            </span>
            <Link to="/dashboard">Dashboard</Link>
            <a href="#" onClick={handleLogout}>Logout</a>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
