import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-inner">
          <div>
            <div className="foot-logo">
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--g)',
                  borderRadius: '9px 2px 9px 2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <path
                    d="M2.5 14.5C2.5 6,14.5 2.5,14.5 2.5C14.5 2.5,11 14.5,2.5 14.5Z"
                    fill="white"
                  />
                </svg>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                Eco<span style={{ color: 'var(--g)' }}>Loop</span>
              </span>
            </div>
            <p className="foot-desc">
              Building a sustainable future by connecting communities to reduce waste
              and give items a second life. Together, we create positive environmental
              impact.
            </p>
            <div className="foot-eco">
              🌍 Impact: 2,847kg waste diverted
            </div>
          </div>

          <div>
            <h5 className="foot-col-h">Product</h5>
            <ul className="foot-links">
              <li>
                <a href="#browse">Browse Items</a>
              </li>
              <li>
                <a href="#post">Post Ad</a>
              </li>
              <li>
                <a href="#how">How it Works</a>
              </li>
              <li>
                <a href="#leaderboard">Top Fans</a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="foot-col-h">Company</h5>
            <ul className="foot-links">
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#careers">Careers</a>
              </li>
              <li>
                <a href="#press">Press</a>
              </li>
              <li>
                <a href="#blog">Blog</a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="foot-col-h">Legal</h5>
            <ul className="foot-links">
              <li>
                <a href="#privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms">Terms of Service</a>
              </li>
              <li>
                <a href="#conduct">Community Guidelines</a>
              </li>
              <li>
                <a href="#contact">Contact Support</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-bot">
          <p className="foot-bot-txt">
            © 2026 EcoLoop. Made with ♻️ for a sustainable Sri Lanka.
          </p>
          <div className="foot-socials">
            <a href="#facebook">Facebook</a>
            <a href="#instagram">Instagram</a>
            <a href="#twitter">Twitter</a>
            <a href="#linkedin">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
