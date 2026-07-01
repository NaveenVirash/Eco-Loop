import React, { useState, useEffect, useContext } from 'react';
import { messageAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import '../pages/Messaging.css';

export default function RecyclingPartners({ onPartnerSelect }) {
  const { user } = useContext(AuthContext);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <section className="dashboard-section">
        <h2>🔄 Recycling Partners</h2>
        <div className="loading-spinner">Loading recycling partners...</div>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      <div className="section-header">
        <h2>🔄 Recycling Partners</h2>
        <button 
          className="btn-toggle"
          onClick={fetchPartners}
        >
          🔄 Refresh
        </button>
      </div>

      {error && <div className="chat-error">{error}</div>}

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
                  onClick={() => onPartnerSelect(partner)}
                >
                  💬 Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
