import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI, messageAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Message Form State
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageSuccess, setMessageSuccess] = useState('');
  const [messageError, setMessageError] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getOne(id);
      setProduct(response.data.data);
      setMessageSubject(`Inquiry: ${response.data.data.title}`);
    } catch (err) {
      setError('Product not found or failed to load details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!messageBody.trim()) {
      setMessageError('Message content cannot be empty.');
      return;
    }

    setMessageLoading(true);
    setMessageSuccess('');
    setMessageError('');

    try {
      await messageAPI.sendMessage(
        product.user._id,
        messageSubject,
        messageBody
      );
      setMessageSuccess('Message sent successfully!');
      setMessageBody('');
    } catch (err) {
      setMessageError('Failed to send message.');
      console.error(err);
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pd-loading-container">
        <div className="pd-spinner"></div>
        <p>Loading details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-error-container wrap">
        <div className="pd-error-card">
          <h2>⚠️ Error</h2>
          <p>{error || 'Unable to retrieve product details.'}</p>
          <Link to="/" className="btn-back-home">Back to Browse</Link>
        </div>
      </div>
    );
  }

  // Calculate ad duration and remaining time
  const expires = new Date(product.expiresAt);
  const created = new Date(product.createdAt);
  const now = new Date();
  
  const totalDuration = expires.getTime() - created.getTime();
  const timeRemaining = expires.getTime() - now.getTime();
  const isExpired = product.isExpired || timeRemaining <= 0;
  const percentRemaining = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));

  let remainingText = '';
  if (isExpired) {
    remainingText = 'Expired';
  } else {
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) {
      remainingText = `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''} left`;
    } else {
      remainingText = `${hours} hour${hours > 1 ? 's' : ''} left`;
    }
  }

  // Seller points & tier
  const sellerPoints = product.user?.points || 0;
  let sellerTier = 'Eco Starter';
  let sellerTierIcon = '🌱';
  if (sellerPoints >= 150) {
    sellerTier = 'Eco Champion';
    sellerTierIcon = '🌍';
  } else if (sellerPoints >= 75) {
    sellerTier = 'Top Fan';
    sellerTierIcon = '🏆';
  } else if (sellerPoints >= 25) {
    sellerTier = 'Green Hero';
    sellerTierIcon = '🌿';
  }

  return (
    <div className="pd-page-container">
      <div className="wrap">
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link> &gt; <Link to="/products">Browse</Link> &gt; <span>{product.title}</span>
        </div>

        <div className="pd-grid">
          {/* Left Column: Image and Description */}
          <div className="pd-left-col">
            <div className="pd-image-wrapper">
              {product.imageUrl ? (
                <img src={`http://localhost:5000${product.imageUrl}`} alt={product.title} className="pd-image" />
              ) : (
                <div className="pd-image-placeholder">
                  <span className="pd-placeholder-icon">📦</span>
                </div>
              )}
              <span className={`pd-status-badge ${isExpired ? 'expired' : 'active'}`}>
                {isExpired ? '♻️ Handed Over to Recycling' : '🟢 Active Ad'}
              </span>
            </div>

            <div className="pd-card pd-info-card">
              <h2>Product Details</h2>
              <div className="pd-details-row">
                <div className="pd-detail-item">
                  <span className="label">Category</span>
                  <span className="value capitalize">{product.category}</span>
                </div>
                <div className="pd-detail-item">
                  <span className="label">Location</span>
                  <span className="value">📍 {product.location || 'Sri Lanka'}</span>
                </div>
                <div className="pd-detail-item">
                  <span className="label">Price</span>
                  <span className="value highlight">{product.price === 'Free' ? 'Free' : `$${product.price}`}</span>
                </div>
              </div>

              <hr className="divider" />

              <h3>Description</h3>
              <p className="pd-description">{product.description}</p>
            </div>
          </div>

          {/* Right Column: User Info, Ad Duration, and Messaging */}
          <div className="pd-right-col">
            {/* Ad Duration Card */}
            <div className="pd-card pd-duration-card">
              <h3>Ad Visibility & Duration</h3>
              {isExpired ? (
                <div className="pd-expired-notice">
                  <p className="notice-title">⏳ 30-Day Period Concluded</p>
                  <p className="notice-desc">
                    This ad has completed its 30-day listing. It is no longer visible on the public marketplace and has been automatically routed to <strong>recycling center companies</strong> for pickup and repurposing.
                  </p>
                </div>
              ) : (
                <div className="pd-active-duration">
                  <div className="pd-duration-header">
                    <span className="time-remaining">{remainingText}</span>
                    <span className="total-days">of 30 Days limit</span>
                  </div>
                  <div className="pd-progress-track">
                    <div className="pd-progress-bar" style={{ width: `${percentRemaining}%` }}></div>
                  </div>
                  <p className="pd-duration-desc">
                    Ads are displayed to the public for exactly 30 days. After this time, the item is moved to the recycling database so verified green recycling companies can request it.
                  </p>
                  <div className="dates-info">
                    <div><span>Posted:</span> <strong>{new Date(product.createdAt).toLocaleDateString()}</strong></div>
                    <div><span>Expires:</span> <strong>{expires.toLocaleDateString()}</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Seller Info Card */}
            <div className="pd-card pd-user-card">
              <h3>Who Posted This?</h3>
              <div className="pd-user-header">
                <div className="pd-user-avatar">
                  {product.user?.role === 'company' ? '🏢' : '👤'}
                </div>
                <div className="pd-user-title-group">
                  <h4>{product.user?.name || 'Anonymous User'}</h4>
                  <span className={`pd-user-badge role-${product.user?.role}`}>
                    {product.user?.role === 'company' ? '♻️ Recycler' : 'Community Member'}
                  </span>
                </div>
              </div>

              <div className="pd-seller-stats">
                <div className="seller-stat">
                  <span className="stat-label">Member Rating</span>
                  <span className="stat-value">{sellerTierIcon} {sellerTier}</span>
                </div>
                <div className="seller-stat">
                  <span className="stat-label">Eco Points Earned</span>
                  <span className="stat-value text-g">⭐ {sellerPoints} pts</span>
                </div>
              </div>

              <div className="pd-contact-info">
                {product.user?.email && (
                  <div className="contact-item">
                    <span>📧 Email:</span>
                    <strong>{product.user.email}</strong>
                  </div>
                )}
                {product.user?.phone && (
                  <div className="contact-item">
                    <span>📞 Phone:</span>
                    <strong>{product.user.phone}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Messaging Form Card */}
            <div className="pd-card pd-message-card">
              <h3>Inquire About This Item</h3>
              {!user ? (
                <div className="pd-login-prompt">
                  <p>You must be signed in to contact the poster.</p>
                  <Link to="/login" className="btn-login-redirect">Sign In to Message</Link>
                </div>
              ) : user._id === product.user?._id ? (
                <div className="pd-owner-notice">
                  <p>🎉 This is your listing. You can manage or delete it from your dashboard.</p>
                  <Link to="/dashboard" className="btn-dashboard-redirect">Go to Dashboard</Link>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="pd-msg-form">
                  {messageSuccess && <div className="pd-banner success">{messageSuccess}</div>}
                  {messageError && <div className="pd-banner error">{messageError}</div>}

                  <div className="pd-form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="pd-form-group">
                    <label>Your Message</label>
                    <textarea
                      placeholder="Ask the owner about pickup details, condition, availability..."
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      required
                      rows="4"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-send-message"
                    disabled={messageLoading}
                  >
                    {messageLoading ? 'Sending...' : 'Send Inquiry Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
