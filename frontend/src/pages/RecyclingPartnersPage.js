import React, { useState, useEffect, useContext } from 'react'; // Touch to recompile
import { messageAPI, userAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import MessagingChat from './MessagingChat';
import './Messaging.css';

export default function RecyclingPartnersPage() {
  const { user } = useContext(AuthContext);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await messageAPI.getPartners();
      setPartners(response.data.data || []);
    } catch (err) {
      setError('Failed to load recycling partners');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (partner) => {
    if (!user) {
      alert('Please log in to message recycling partners');
      window.location.href = '/login';
      return;
    }
    setSelectedPartner(partner);
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to rate partners');
      window.location.href = '/login';
      return;
    }
    setRatingError('');
    setRatingSuccess('');
    try {
      await userAPI.rateUser(ratingModal._id, { rating: ratingValue, comment: ratingComment });
      setRatingSuccess('Rating submitted successfully!');
      setTimeout(() => {
        setRatingModal(null);
        setRatingSuccess('');
        setRatingValue(5);
        setRatingComment('');
        fetchPartners(); // Refresh partners to show updated rating
      }, 1500);
    } catch (err) {
      setRatingError(err.response?.data?.error || 'Failed to submit rating');
    }
  };

  if (selectedPartner) {
    return (
      <div className="dashboard-container">
        <MessagingChat 
          selectedPartner={selectedPartner}
          onClose={() => setSelectedPartner(null)}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
    
        <h1>♻️ Recycling Partners Directory</h1>
        <p>Connect with verified recycling companies and environmental partners</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {!user && (
        <div style={{
          background: '#E8F5EF',
          border: '1px solid #1E9B6B',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#1A1A18'
        }}>
          <p style={{ margin: 0 }}>
            <strong>💡 Tip:</strong> <a href="/login" style={{ color: '#1E9B6B', textDecoration: 'underline' }}>Sign in</a> to message recycling partners and start conversations about your recycling needs.
          </p>
        </div>
      )}

      {loading ? (
        <section className="dashboard-section">
          <div className="loading-spinner">Loading recycling partners...</div>
        </section>
      ) : (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Available Partners ({partners.length})</h2>
            <button 
              className="btn-toggle"
              onClick={fetchPartners}
            >
              🔄 Refresh
            </button>
          </div>

          {partners.length === 0 ? (
            <p className="empty-state">No recycling partners available yet.</p>
          ) : (
            <div className="partners-container">
              {partners.map(partner => (
                <div key={partner._id} className="partner-card">
                  <div className="partner-header">
                    <div>
                      <span className="partner-name">{partner.name}</span>
                      {partner.averageRating > 0 && (
                        <div style={{ fontSize: '14px', color: '#FFD700', marginTop: '4px' }}>
                          {'⭐'.repeat(Math.round(partner.averageRating))} 
                          <span style={{ color: '#666', fontSize: '12px', marginLeft: '4px' }}>
                            ({partner.averageRating.toFixed(1)} - {partner.ratingCount} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="partner-company-badge">♻️ Partner</span>
                  </div>

                  <div className="partner-info">
                    {partner.email && (
                      <div className="partner-detail">
                        <label>Email:</label>
                        <span>{partner.email}</span>
                      </div>
                    )}
                    {partner.phone && (
                      <div className="partner-detail">
                        <label>Phone:</label>
                        <span>{partner.phone}</span>
                      </div>
                    )}
                    {partner.address && (
                      <div className="partner-detail">
                        <label>Address:</label>
                        <span>{partner.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="partner-actions">
                    <button
                      className="btn-message"
                      onClick={() => handleMessageClick(partner)}
                    >
                      💬 Message
                    </button>
                    {user && user._id !== partner._id && (
                      <button
                        className="btn-toggle"
                        onClick={() => {
                          setRatingModal(partner);
                          setRatingError('');
                          setRatingSuccess('');
                          setRatingValue(5);
                          setRatingComment('');
                        }}
                        style={{ marginLeft: '10px' }}
                      >
                        ⭐ Rate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '30px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <h2>Rate {ratingModal.name}</h2>
            {ratingError && <div className="error-banner" style={{ margin: '10px 0' }}>{ratingError}</div>}
            {ratingSuccess && <div className="success-banner" style={{ margin: '10px 0', color: 'green' }}>{ratingSuccess}</div>}
            <form onSubmit={handleRateSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Rating (1-5)</label>
                <select 
                  value={ratingValue} 
                  onChange={(e) => setRatingValue(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>{num} Stars</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Comment (Optional)</label>
                <textarea 
                  value={ratingComment} 
                  onChange={(e) => setRatingComment(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' }}
                  placeholder="Leave a comment about this partner..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setRatingModal(null)} style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#1E9B6B', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Rating</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
