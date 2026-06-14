import React, { useState, useEffect, useContext } from 'react';
import { messageAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import MessagingChat from './MessagingChat';
import './Messaging.css';

export default function RecyclingPartnersPage() {
  const { user } = useContext(AuthContext);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);

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
                    <span className="partner-name">{partner.name}</span>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
