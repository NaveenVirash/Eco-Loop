import React, { useState, useEffect } from 'react';
import { API } from '../utils/api';
import './Leaderboard.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const response = await API.user.getAll();
      const sortedUsers = response.data.data.sort((a, b) => (b.points || 0) - (a.points || 0));
      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Use mock data if API fails
      setUsers([
        { _id: '1', name: 'Alex Kumar', points: 2450 },
        { _id: '2', name: 'Maria Santos', points: 2180 },
        { _id: '3', name: 'Raj Patel', points: 1950 },
        { _id: '4', name: 'Sophie Chen', points: 1820 },
        { _id: '5', name: 'James Wilson', points: 1640 },
      ]);
    }
  };

  const getTopThree = () => users.slice(0, 3);
  const getRest = () => users.slice(3);

  const allBadges = [
    { id: 1, name: 'Eco Warrior', icon: '🌍', requirement: '100 items shared', earned: true },
    { id: 2, name: 'Collector', icon: '🏆', requirement: '50 items collected', earned: true },
    { id: 3, name: 'Recycler Pro', icon: '♻️', requirement: '25 recycling items', earned: false },
    { id: 4, name: 'Green Thumb', icon: '🌱', requirement: '10 donations', earned: false },
  ];

  return (
    <section className="lb-sec" id="leaderboard">
      <div className="wrap">
        <div className="sec-kicker" style={{ color: 'rgba(255,255,255,.45)' }}>
          <span className="chip chip-gray">🏅 Recognition</span>
        </div>
        <h2 className="sec-title">Top Community Fans</h2>
        <p className="sec-sub">
          Celebrate the members making the biggest environmental impact.
        </p>

        <div className="lb-grid">
          {/* Podium */}
          <div>
            <div className="podium">
              {getTopThree().map((user, idx) => (
                <div key={user._id} className={`pod-item r${idx + 1}`}>
                  <div className="pod-av-wrap">
                    <div className="pod-av">{user.name.charAt(0)}</div>
                    {idx === 0 && <div className="pod-crown">👑</div>}
                  </div>
                  <div className="pod-name">{user.name}</div>
                  <div className="pod-pts">{user.points} pts</div>
                  <div className="pod-block">{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* List */}
          <div>
            <div className="lb-list">
              {getTopThree().map((user, idx) => (
                <div key={user._id} className="lb-row">
                  <div className="lb-rank">#{idx + 1}</div>
                  <div
                    className="lb-av"
                    style={{ background: 'rgba(255,255,255,.08)' }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="lb-name">{user.name}</div>
                  {idx === 0 && (
                    <span className="lb-badge" style={{ background: 'rgba(196, 123, 20, 0.25)', color: '#FAC775' }}>
                      🥇 Gold
                    </span>
                  )}
                  {idx === 1 && (
                    <span className="lb-badge" style={{ background: 'rgba(192, 192, 192, 0.25)', color: '#C0C0C0' }}>
                      🥈 Silver
                    </span>
                  )}
                  {idx === 2 && (
                    <span className="lb-badge" style={{ background: 'rgba(205, 127, 50, 0.25)', color: '#CD7F32' }}>
                      🥉 Bronze
                    </span>
                  )}
                  <div className="lb-pts">{user.points} pts</div>
                </div>
              ))}

              {getRest().map((user, idx) => (
                <div key={user._id} className="lb-row">
                  <div className="lb-rank">#{idx + 4}</div>
                  <div className="lb-av">{user.name.charAt(0)}</div>
                  <div className="lb-name">{user.name}</div>
                  <div className="lb-pts">{user.points} pts</div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div className="badges-row">
              <div className="badges-head">🎖️ Badges</div>
              <div className="badges-g">
                {allBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
                  >
                    <div
                      className="badge-ic"
                      style={{
                        background: badge.earned ? 'var(--g-lt)' : 'rgba(255,255,255,.04)',
                      }}
                    >
                      {badge.icon}
                    </div>
                    <div>
                      <div className="badge-name">{badge.name}</div>
                      <div className="badge-req">{badge.requirement}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
