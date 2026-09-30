import React, { useState, useEffect } from 'react';
import { API } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import './Leaderboard.css';

// ─── Badge mapping (mirrors pointsHelper.js) ────────────────────────────────
const BADGE_MAP = {
  'Eco Champion': { icon: '🌍', color: '#1E9B6B', bg: '#E8F5EF' },
  'Top Fan':      { icon: '🏆', color: '#C47B14', bg: '#FFF8D6' },
  'Green Hero':   { icon: '🌿', color: '#2A76D4', bg: '#EAF3FF' },
  'Eco Starter':  { icon: '🌱', color: '#5A5A56', bg: '#F8F7F3' },
};

// ─── Next Monday midnight UTC countdown ─────────────────────────────────────
const getNextMondayCountdown = () => {
  const now   = new Date();
  const day   = now.getUTCDay(); // 0=Sun, 1=Mon ...
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const next  = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday));
  const diffMs = next - now;
  const days   = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours  = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins   = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${days}d ${hours}h ${mins}m`;
};

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(getNextMondayCountdown());

  useEffect(() => {
    fetchLeaderboardData();
    const timer = setInterval(() => setCountdown(getNextMondayCountdown()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      const response = await API.user.getLeaderboard();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="lb-page">
      <div className="wrap lb-wrap">

        {/* ── Header ── */}
        <div className="lb-hero">
          <h2 className="lb-title">Weekly Top Fans 🏆</h2>
          <p className="lb-subtitle">
            The top 10 eco-warriors making the biggest impact this week. Earn points by donating
            items and contacting recycling centres!
          </p>
          <div className="lb-reset-chip">
            🔄 Resets in <strong>{countdown}</strong>
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="lb-loading">Loading top fans…</div>
        ) : (
          <div className="leaderboard-list">
            {users.length === 0 ? (
              <div className="lb-empty">
                No top fans yet. Be the first to earn points!
              </div>
            ) : (
              users.map((u, index) => {
                let rankClass = '';
                let rankBadge = `#${index + 1}`;
                if (index === 0) { rankClass = 'rank-gold';   rankBadge = '🥇 1st'; }
                else if (index === 1) { rankClass = 'rank-silver'; rankBadge = '🥈 2nd'; }
                else if (index === 2) { rankClass = 'rank-bronze'; rankBadge = '🥉 3rd'; }

                const isCurrentUser = user && u._id === user._id;
                const badgeInfo = BADGE_MAP[u.badge] || BADGE_MAP['Eco Starter'];

                return (
                  <div
                    key={u._id}
                    className={`leaderboard-item ${rankClass} ${isCurrentUser ? 'is-me' : ''}`}
                  >
                    <div className="lb-rank">{rankBadge}</div>

                    <div className="lb-avatar">{u.name.charAt(0).toUpperCase()}</div>

                    <div className="lb-name-block">
                      <div className="lb-name">
                        {u.name}
                        {isCurrentUser && <span className="lb-me-badge">You</span>}
                      </div>
                      {u.averageRating > 0 && (
                        <div className="lb-rating">
                          {'⭐'.repeat(Math.round(u.averageRating))}{' '}
                          <span className="lb-rating-val">({u.averageRating.toFixed(1)})</span>
                        </div>
                      )}
                    </div>

                    {/* Badge chip */}
                    <div
                      className="lb-badge-chip"
                      style={{ color: badgeInfo.color, background: badgeInfo.bg }}
                      title={u.badge}
                    >
                      {badgeInfo.icon} {u.badge}
                    </div>

                    {/* Points */}
                    <div className="lb-pts-block">
                      <div className="lb-points">{u.weeklyPoints ?? 0} pts</div>
                      <div className="lb-total-pts">{u.points ?? 0} all-time</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Badge legend ── */}
        <div className="lb-legend">
          <h3 className="lb-legend-title">Badge Tiers</h3>
          <div className="lb-legend-grid">
            {[
              { badge: 'Eco Starter',  min: '0 pts'   },
              { badge: 'Green Hero',   min: '25 pts'  },
              { badge: 'Top Fan',      min: '75 pts'  },
              { badge: 'Eco Champion', min: '150 pts' },
            ].map(({ badge, min }) => {
              const info = BADGE_MAP[badge];
              return (
                <div
                  key={badge}
                  className="lb-legend-item"
                  style={{ color: info.color, background: info.bg, borderColor: info.color + '44' }}
                >
                  <span className="lb-legend-icon">{info.icon}</span>
                  <span className="lb-legend-name">{badge}</span>
                  <span className="lb-legend-min">{min}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Leaderboard;
