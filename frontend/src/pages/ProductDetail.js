import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productAPI, messageAPI, userAPI } from '../utils/api';
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
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState('');
  const [transactionError, setTransactionError] = useState('');

  // Rating State
  const [ratingModal, setRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');

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

  const handleTransactionAction = async (action) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user._id === product.user?._id) {
      setTransactionError('You cannot complete your own listing.');
      return;
    }

    setTransactionLoading(true);
    setTransactionError('');
    setTransactionMessage('');

    try {
      let res;
      if (action === 'claim') {
        res = await productAPI.claimCollection(product._id);
      } else if (action === 'collector') {
        res = await productAPI.confirmCollector(product._id);
      } else if (action === 'donor') {
        res = await productAPI.confirmDonor(product._id);
      }

      setTransactionMessage(res.data.message || 'Transaction updated');
      await fetchProduct();
    } catch (err) {
      setTransactionError(err.response?.data?.error || 'Failed to update transaction');
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setRatingError('');
    setRatingSuccess('');
    try {
      await userAPI.rateUser(product.user._id, { rating: ratingValue, comment: ratingComment });
      setRatingSuccess('Rating submitted successfully!');
      setTimeout(() => {
        setRatingModal(false);
        setRatingSuccess('');
        setRatingValue(5);
        setRatingComment('');
        fetchProduct(); // Refresh to show updated rating
      }, 1500);
    } catch (err) {
      setRatingError(err.response?.data?.error || 'Failed to submit rating');
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
                <img src={product.imageUrl} alt={product.title} className="pd-image" />
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

              {product.user?.averageRating > 0 && (
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <div style={{ fontSize: '18px', color: '#FFD700', marginBottom: '4px' }}>
                    {'⭐'.repeat(Math.round(product.user.averageRating))} 
                  </div>
                  <span style={{ color: '#666', fontSize: '13px' }}>
                    {product.user.averageRating.toFixed(1)}/5 ({product.user.ratingCount} reviews)
                  </span>
                </div>
              )}

              {user && user._id !== product.user?._id && (
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <button 
                    onClick={() => setRatingModal(true)}
                    style={{ background: '#f0f0f0', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    ⭐ Rate {product.user?.role === 'company' ? 'Company' : 'User'}
                  </button>
                </div>
              )}

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
                <>
                  {product.listingType === 'marketplace' && (
                    <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid #e6f4ea', borderRadius: '8px', background: '#f7fcf8' }}>
                      <h4 style={{ margin: '0 0 6px', fontSize: '15px' }}>🤝 Dual Confirmation</h4>
                      <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#47624a' }}>
                        Points are awarded only after both sides confirm the transaction.
                      </p>
                      {transactionMessage && <div className="pd-banner success">{transactionMessage}</div>}
                      {transactionError && <div className="pd-banner error">{transactionError}</div>}
                      {product.status === 'completed' ? (
                        <p style={{ margin: 0, fontSize: '13px', color: '#1e9b6b' }}>✅ This transaction has already been completed.</p>
                      ) : product.status === 'pending_collection' && product.collectedBy ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <p style={{ margin: 0, fontSize: '13px' }}>
                            {product.collectedBy?._id === user._id || product.collectedBy === user._id
                              ? 'You are the buyer for this item. Confirm once the handover is done.'
                              : 'The buyer has claimed this item. Waiting for the donor to confirm.'}
                          </p>
                          {((product.collectedBy?._id === user._id) || (product.collectedBy === user._id)) && (
                            <button
                              type="button"
                              className="btn-send-message"
                              onClick={() => handleTransactionAction('collector')}
                              disabled={transactionLoading}
                            >
                              {transactionLoading ? 'Saving...' : 'Confirm Pickup'}
                            </button>
                          )}
                          {user._id === product.user?._id && (
                            <button
                              type="button"
                              className="btn-send-message"
                              onClick={() => handleTransactionAction('donor')}
                              disabled={transactionLoading}
                            >
                              {transactionLoading ? 'Saving...' : 'Confirm Done'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-send-message"
                          onClick={() => handleTransactionAction('claim')}
                          disabled={transactionLoading}
                        >
                          {transactionLoading ? 'Saving...' : 'Buy / Claim Item'}
                        </button>
                      )}
                    </div>
                  )}

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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '30px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
            <h2>Rate {product.user?.name}</h2>
            {ratingError && <div className="pd-banner error" style={{ margin: '10px 0' }}>{ratingError}</div>}
            {ratingSuccess && <div className="pd-banner success" style={{ margin: '10px 0' }}>{ratingSuccess}</div>}
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
                  placeholder="Leave a comment about this user..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setRatingModal(false)} style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#1E9B6B', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Rating</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
