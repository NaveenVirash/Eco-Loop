import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavbarNew.css';

const NavbarNew = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="nav">
        <div className="wrap">
          <div className="nav-row">
            <Link to="/" className="logo">
              <div className="logo-mark">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                >
                  <path
                    d="M2.5 14.5C2.5 6,14.5 2.5,14.5 2.5C14.5 2.5,11 14.5,2.5 14.5Z"
                    fill="white"
                  />
                </svg>
              </div>
              Eco<span>Loop</span>
            </Link>

            <ul className="nav-links">
              <li>
                <Link to="/products">Browse</Link>
              </li>
              <li>
                <Link to="/#how">How it works</Link>
              </li>
              <li>
                <Link to="/recycling-partners">Recycling Partners</Link>
              </li>
              <li>
                <Link to="/leaderboard">Top Fans</Link>
              </li>
              <li>
                <Link to="/post">Post Ad</Link>
              </li>
            </ul>

            <div className="nav-right">
              {user && (
                <div className="pts-pill">⭐ {user.points || 0} pts</div>
              )}
              {!user ? (
                <>
                  <Link to="/login" className="btn btn-out btn-sm">
                    Sign in
                  </Link>
                  <Link to="/post" className="btn btn-g btn-sm">
                    Post Ad
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="btn btn-out btn-sm">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-g btn-sm"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            <button
              className="ham"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <div className={`mob-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/products" onClick={toggleMenu}>
          Browse Listings
        </Link>
        <Link to="/#how" onClick={toggleMenu}>
          How it works
        </Link>
        <Link to="/#recyclers" onClick={toggleMenu}>
          Recycling Partners
        </Link>
        <Link to="/leaderboard" onClick={toggleMenu}>
          Top Fans
        </Link>
        <Link to="/post" onClick={toggleMenu}>
          Post an Ad
        </Link>
        {!user ? (
          <Link
            to="/login"
            onClick={toggleMenu}
            style={{
              color: 'var(--g)',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign in / Register
          </Link>
        ) : (
          <>
            <Link to="/dashboard" onClick={toggleMenu}>
              Dashboard
            </Link>
            <a
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              style={{
                color: 'var(--coral)',
                fontWeight: 700,
              }}
            >
              Logout
            </a>
          </>
        )}
      </div>
    </>
  );
};

export default NavbarNew;
