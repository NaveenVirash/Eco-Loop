import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-blob"></div>
        <div className="hero-dots"></div>
        <div className="wrap">
          <div className="hero-inner">
            <div>
              <div className="hero-kicker fu">
                
              </div>
              <h1 className="hero-title fu d1">
                Give your<br />
                household goods
                <br />a <em>second life</em>
              </h1>
              <p className="hero-desc fu d2">
                Share usable items with your community — free or for a small
                price. Items that can't be reused go straight to certified
                recycling partners. Zero waste, maximum impact.
              </p>
              <div className="hero-ctas fu d3">
                <Link to="/products" className="btn btn-g btn-lg">
                  Browse items
                </Link>
                <Link to="/post" className="btn btn-out btn-lg">
                  Post an ad →
                </Link>
              </div>
              <div className="hero-trust fu d4">
                <div className="avs">
                  <div className="av">NK</div>
                  <div className="av">SR</div>
                  <div className="av">PF</div>
                  <div className="av">AW</div>
                  <div className="av" style={{ background: 'var(--g)', color: '#fff' }}>
                    +
                  </div>
                </div>
                <span className="hero-trust-txt">
                  <strong>4,200+</strong> members across Sri Lanka
                </span>
              </div>
            </div>
            <div className="hero-vis fu d5">
              <div className="item-mosaic">
                <div className="mosaic-card">
                  <div className="mc-icon" style={{ background: '#E8F5EF' }}>
                    🪑
                  </div>
                  <div className="mc-name">Wooden Chair</div>
                  <div className="mc-loc">Colombo 07</div>
                  <div className="mc-price">
                    <span className="chip chip-g">Free</span>
                  </div>
                </div>
                <div className="mosaic-card">
                  <div className="mc-icon" style={{ background: '#E8F0FB' }}>
                    📱
                  </div>
                  <div className="mc-name">Samsung S9</div>
                  <div className="mc-loc">Kandy</div>
                  <div className="mc-price">
                    <span className="chip chip-a">LKR 8,000</span>
                  </div>
                </div>
                <div className="mosaic-card">
                  <div className="mc-icon" style={{ background: '#FBF0DA' }}>
                    👕
                  </div>
                  <div className="mc-name">Kids Clothes × 10</div>
                  <div className="mc-loc">Galle</div>
                  <div className="mc-price">
                    <span className="chip chip-g">Free</span>
                  </div>
                </div>
                <div className="mosaic-card">
                  <div className="mc-icon" style={{ background: '#FAECE5' }}>
                    🔧
                  </div>
                  <div className="mc-name">Toolbox Set</div>
                  <div className="mc-loc">Negombo</div>
                  <div className="mc-price">
                    <span className="chip chip-a">LKR 2,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="wrap">
          <div className="stats-row">
            <div className="s-item">
              <div className="s-num">18,640</div>
              <div className="s-lbl">Items Shared</div>
            </div>
            <div className="s-sep"></div>
            <div className="s-item">
              <div className="s-num">4,200+</div>
              <div className="s-lbl">Community Members</div>
            </div>
            <div className="s-sep"></div>
            <div className="s-item">
              <div className="s-num">2,847 kg</div>
              <div className="s-lbl">Waste Diverted</div>
            </div>
            <div className="s-sep"></div>
            <div className="s-item">
              <div className="s-num">98%</div>
              <div className="s-lbl">Items Reused</div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="sec" id="how">
        <div className="wrap">
          <div className="sec-kicker">
            <span className="chip chip-g">📋 Process</span>
          </div>
          <h2 className="sec-title">How EcoLoop Works</h2>
          <p className="sec-sub">
            Four simple steps to share, earn points, and make a difference.
          </p>

          <div className="steps">
            <div className="step">
              <div className="step-n">01</div>
              <div className="step-icon">📸</div>
              <h3 className="step-title">List Your Items</h3>
              <p className="step-desc">
                Upload photos and details of items you want to share or sell.
              </p>
              <div className="step-pts">⭐ 10 pts</div>
            </div>
            <div className="step">
              <div className="step-n">02</div>
              <div className="step-icon">🔍</div>
              <h3 className="step-title">Get Discovered</h3>
              <p className="step-desc">
                Community members browse and connect with your offerings.
              </p>
              <div className="step-pts">⭐ 5 pts</div>
            </div>
            <div className="step">
              <div className="step-n">03</div>
              <div className="step-icon">💬</div>
              <h3 className="step-title">Arrange Exchange</h3>
              <p className="step-desc">
                Chat with buyers and arrange pickup or delivery.
              </p>
              <div className="step-pts">⭐ 15 pts</div>
            </div>
            <div className="step">
              <div className="step-n">04</div>
              <div className="step-icon">♻️</div>
              <h3 className="step-title">Earn & Recycle</h3>
              <p className="step-desc">
                Receive points, get verified badges, and items go to recyclers.
              </p>
              <div className="step-pts">⭐ 20 pts</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-sec" id="cta">
        <div className="cta-glow"></div>
        <div className="wrap">
          <div className="cta-inner">
            <h2 className="cta-title">
              Ready to <em style={{ fontStyle: 'italic', color: 'var(--g-mid)' }}>give</em> your items a second life?
            </h2>
            <p className="cta-desc">
              Join thousands of members already making a positive impact on the
              environment while saving money and earning rewards.
            </p>
            <div className="cta-btns">
              <Link to="/products" className="btn btn-g btn-lg">
                Browse Now
              </Link>
              <Link to="/register" className="btn btn-wh btn-lg">
                Join Community
              </Link>
            </div>
            <div className="cta-nums">
              <div className="cn-item">
                <div className="cn-num">486</div>
                <div className="cn-lbl">NEW ITEMS THIS WEEK</div>
              </div>
              <div className="cn-item">
                <div className="cn-num">18.6k</div>
                <div className="cn-lbl">TOTAL ITEMS SHARED</div>
              </div>
              <div className="cn-item">
                <div className="cn-num">2.8t</div>
                <div className="cn-lbl">WASTE DIVERTED</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
