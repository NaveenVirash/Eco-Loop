import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🌱 EcoLoop
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          {user ? (
            <>
              {user.role === 'admin' ? (
                <li className="nav-item">
                  <Link to="/admin" className="nav-link">Admin Dashboard</Link>
                </li>
              ) : (
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                </li>
              )}
              <li className="nav-item">
                <span className="nav-user">Welcome, {user.name}</span>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-btn logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-btn">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-btn register-btn">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
