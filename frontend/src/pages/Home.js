import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome to EcoLoop</h1>
            <p>Community Recyclable Redistribution Platform</p>
            <p className="subtitle">
              Give items a second life. Share, trade, and build a sustainable community.
            </p>
            <div className="hero-cta">
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link to="/admin" className="btn-primary">
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="btn-primary">
                      Go to Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                  <Link to="/login" className="btn-secondary">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="emoji-large">🌱</div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>How EcoLoop Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>List Items</h3>
            <p>Post items you want to share or give away to the community.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Browse & Discover</h3>
            <p>Explore items available in your community with ease.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💚</div>
            <h3>Reduce Waste</h3>
            <p>Give items a second life and help the environment.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Build Community</h3>
            <p>Connect with like-minded people and create positive impact.</p>
          </div>
        </div>
      </section>

      <section className="about">
        <h2>About EcoLoop</h2>
        <p>
          EcoLoop is a community-driven platform designed to promote sustainable living 
          by making it easy to share, trade, and redistribute items within your community. 
          Our mission is to reduce waste, build stronger communities, and make recycling accessible to everyone.
        </p>
      </section>

      <footer className="footer">
        <p>&copy; 2026 EcoLoop. All rights reserved.</p>
      </footer>
    </div>
  );
}
