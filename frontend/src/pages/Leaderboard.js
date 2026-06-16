import React, { useState, useEffect } from 'react';
import { API } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css'; // For leaderboard styles we added earlier

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
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
    <section style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', padding: '120px 20px 60px 20px' }}>
      <div className="wrap" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '12px', color: '#1A1A18', fontFamily: "'Fraunces', serif" }}>
            Weekly Top Fans 🏆
          </h2>
          <p style={{ color: '#5A5A56', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
            The top 10 users making the biggest impact this week. Earn points by posting items and donating to recycling centers!
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#5A5A56' }}>
            Loading top fans...
          </div>
        ) : (
          <div className="leaderboard-list">
            {users.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px solid #E0DFD9', color: '#5A5A56' }}>
                No top fans yet. Be the first to earn points!
              </div>
            ) : (
              users.map((u, index) => {
                let rankClass = '';
                let rankBadge = `#${index + 1}`;
                if (index === 0) { rankClass = 'rank-gold'; rankBadge = '🥇 1st'; }
                else if (index === 1) { rankClass = 'rank-silver'; rankBadge = '🥈 2nd'; }
                else if (index === 2) { rankClass = 'rank-bronze'; rankBadge = '🥉 3rd'; }

                return (
                  <div key={u._id} className={`leaderboard-item ${rankClass} ${user && u._id === user._id ? 'is-me' : ''}`}>
                    <div className="lb-rank">{rankBadge}</div>
                    <div className="lb-avatar">{u.name.charAt(0).toUpperCase()}</div>
                    <div className="lb-name">
                      {u.name} {user && u._id === user._id && <span className="lb-me-badge">You</span>}
                    </div>
                    <div className="lb-points">
                      {u.points} pts
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
        
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <div className="hpw-badges" style={{ display: 'inline-flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', maxWidth: '100%', background: 'transparent', border: 'none', padding: '0' }}>
            <div className="hpw-badge" style={{ background: '#fff', padding: '12px 20px', borderRadius: '99px', border: '1px solid #E0DFD9' }}><span>🌱 Eco Starter</span></div>
            <div className="hpw-badge" style={{ background: '#fff', padding: '12px 20px', borderRadius: '99px', border: '1px solid #E0DFD9' }}><span>🌿 Green Hero</span></div>
            <div className="hpw-badge" style={{ background: '#fff', padding: '12px 20px', borderRadius: '99px', border: '1px solid #E0DFD9' }}><span>🏆 Top Fan</span></div>
            <div className="hpw-badge" style={{ background: '#fff', padding: '12px 20px', borderRadius: '99px', border: '1px solid #E0DFD9' }}><span>🌍 Eco Champion</span></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
