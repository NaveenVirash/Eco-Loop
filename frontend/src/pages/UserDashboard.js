import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, transactionAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import UserMessages from './UserMessages';
import './Dashboard.css';

// ─── Badge helper (mirrors pointsHelper.js thresholds) ──────────────────────
const getBadgeInfo = (points) => {
  if (points >= 150) return { name: 'Eco Champion', icon: '🌍', next: null, nextThreshold: 150 };
  if (points >= 75)  return { name: 'Top Fan',      icon: '🏆', next: 'Eco Champion', nextThreshold: 150 };
  if (points >= 25)  return { name: 'Green Hero',   icon: '🌿', next: 'Top Fan',      nextThreshold: 75  };
  return                     { name: 'Eco Starter', icon: '🌱', next: 'Green Hero',   nextThreshold: 25  };
};

const PREV_THRESHOLDS = { 25: 0, 75: 25, 150: 75 };

// ─── Small toast component ───────────────────────────────────────────────────
const PointsToast = ({ message, onClose }) => (
  <div className="points-toast" role="status" aria-live="polite">
    <span>{message}</span>
    <button onClick={onClose} className="points-toast-close" aria-label="Dismiss">✕</button>
  </div>
);

export default function UserDashboard() {
  const { user, loading: authLoading, updateUserProfile, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // ── Listings state ──────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // ── Transactions state ──────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState('');
  const [confirmingTxId, setConfirmingTxId] = useState(null);
  const [pointsToast, setPointsToast] = useState(null); // { message, badge }

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('listings');

  // ── Profile form ────────────────────────────────────────────────────────────
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.address || '');
      setProfileBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProducts();
    }
  }, [authLoading, user]);

  // Auto-fetch transactions when that tab is opened
  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getMyProducts();
      setProducts(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch your listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setTxLoading(true);
      setTxError('');
      const res = await transactionAPI.getMyTransactions();
      setTransactions(res.data.data);
    } catch (err) {
      setTxError(err.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      setTxLoading(false);
    }
  }, []);

  // ── Listings confirm pickup ──────────────────────────────────────────────────
  const handleConfirmPickup = async (productId) => {
    if (!window.confirm('Confirm that the collector picked up your item?')) return;
    try {
      setConfirmingId(productId);
      const res = await productAPI.confirmDonor(productId);
      alert(res.data.message || 'Pickup confirmation saved');
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to confirm pickup');
    } finally {
      setConfirmingId(null);
    }
  };

  // ── Marketplace transaction confirms ────────────────────────────────────────
  const handleTxConfirm = async (txId, role) => {
    try {
      setConfirmingTxId(txId);
      let res;
      if (role === 'buyer') {
        res = await transactionAPI.confirmBuyer(txId);
      } else {
        res = await transactionAPI.confirmSeller(txId);
      }

      const result = res.data.completionResult;
      if (result?.completed && !result?.alreadyAwarded) {
        // Determine which result applies to the current user
        const myResult = role === 'seller' ? result.donorResult : result.collectorResult;
        if (myResult) {
          const badgeMsg = myResult.badge !== user?.badge ? ` New badge: ${myResult.badge}!` : '';
          setPointsToast({
            message: `🎉 +${role === 'seller' ? 10 : 5} pts awarded! Total: ${myResult.newPoints} pts.${badgeMsg}`
          });
          // Refresh auth context so point count & badge update globally
          await refreshUser();
        }
      }

      await fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to confirm transaction');
    } finally {
      setConfirmingTxId(null);
    }
  };

  // ── Product CRUD ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await productAPI.update(editingProduct._id, {
        title: editingProduct.title,
        category: editingProduct.category,
        description: editingProduct.description,
        price: editingProduct.price,
      });
      fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      setError('Failed to update product');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);
    try {
      const res = await updateUserProfile(profileName, profilePhone, profileAddress, profileBio);
      if (res.success) {
        setProfileSuccess('Profile updated successfully!');
      } else {
        setProfileError(res.error);
      }
    } catch (err) {
      setProfileError('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const myProducts = products || [];
  const myMarketplaceCount = myProducts.filter(p => p.listingType !== 'recycling').length;
  const myRecyclingCount   = myProducts.filter(p => p.listingType === 'recycling').length;

  const currentPoints = user?.points || 0;
  const badge = getBadgeInfo(currentPoints);
  const prevThreshold = PREV_THRESHOLDS[badge.nextThreshold] ?? 0;
  const pointsInTier  = currentPoints - prevThreshold;
  const tierSize      = badge.nextThreshold - prevThreshold;
  const pointsProgress = badge.next ? Math.min((pointsInTier / tierSize) * 100, 100) : 100;

  // ── Transaction status helpers ──────────────────────────────────────────────
  const txStatusInfo = (tx) => {
    if (tx.status === 'completed')  return { label: '✅ Completed',   cls: 'tx-pill-completed' };
    if (tx.status === 'rejected')   return { label: '❌ Rejected',    cls: 'tx-pill-rejected'  };
    if (tx.status === 'cancelled')  return { label: '🚫 Cancelled',   cls: 'tx-pill-cancelled' };
    if (tx.status === 'accepted')   return { label: '✔️ Accepted',   cls: 'tx-pill-accepted'  };
    return                                 { label: '🕐 Requested',  cls: 'tx-pill-requested' };
  };

  const isMe = (id) => id?.toString() === user?._id?.toString();

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">
      {/* Points toast */}
      {pointsToast && (
        <PointsToast
          message={pointsToast.message}
          onClose={() => setPointsToast(null)}
        />
      )}

      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1>Welcome, {user?.name}!</h1>
          <span className="badge-tier-chip">
            {badge.icon} {badge.name}
          </span>
        </div>
        <p>Manage your items, check rewards, and update your settings</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* ── Tabs ── */}
      <div className="admin-tabs">
        <button
          id="tab-listings"
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          My Listings
        </button>
        <button
          id="tab-transactions"
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          🔄 Transactions
        </button>
        <button
          id="tab-messages"
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages
        </button>
        <button
          id="tab-profile"
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('profile');
            setProfileSuccess('');
            setProfileError('');
          }}
        >
          My Profile
        </button>
      </div>

      <div className="dashboard-content" style={{ marginTop: '20px' }}>

        {/* ─── LISTINGS ─── */}
        {activeTab === 'listings' && (
          <>
            <section className="dashboard-section">
              <div className="section-header">
                <h2>Upload New Product</h2>
                <button className="btn-toggle" onClick={() => navigate('/post')}>
                  + Post Ad
                </button>
              </div>
            </section>

            <section className="dashboard-section">
              <h2>My Products ({myProducts.length})</h2>
              {myProducts.length === 0 ? (
                <p className="empty-state">You haven't uploaded any products yet.</p>
              ) : (
                <div className="products-grid">
                  {myProducts.map(product => {
                    const isPending   = product.status === 'pending_collection';
                    const isCompleted = product.status === 'completed';
                    return (
                      <div key={product._id} className="product-card">
                        <div className="product-header">
                          <h3>{product.title}</h3>
                          <span className="category-badge">{product.category}</span>
                        </div>
                        <p className="product-desc">{product.description}</p>
                        {product.price && <p className="product-price">Rs.{product.price}</p>}
                        <p className="product-date">
                          Posted: {new Date(product.createdAt).toLocaleDateString()}
                        </p>
                        {product.collectedBy && (
                          <p className="product-date" style={{ color: '#1E9B6B', fontWeight: '500' }}>
                            Collected by: {product.collectedBy.name || product.collectedBy.email}
                          </p>
                        )}
                        <div style={{ marginBottom: '10px' }}>
                          {isCompleted ? (
                            <span style={{ display: 'inline-block', background: '#E8F5EF', color: '#1E9B6B', padding: '6px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>✅ Completed</span>
                          ) : isPending ? (
                            <span style={{ display: 'inline-block', background: '#FBF0DA', color: '#C88A15', padding: '6px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>🟡 Awaiting your confirmation</span>
                          ) : (
                            <span style={{ display: 'inline-block', background: '#EAF3FF', color: '#2A76D4', padding: '6px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>🟢 Active</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                          {!isCompleted && isPending && (
                            <button
                              className="btn-edit-sm"
                              onClick={() => handleConfirmPickup(product._id)}
                              disabled={confirmingId === product._id}
                              style={{ background: '#1E9B6B', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              {confirmingId === product._id ? 'Saving...' : 'Confirm Pickup'}
                            </button>
                          )}
                          <button
                            className="btn-edit-sm"
                            onClick={() => setEditingProduct(product)}
                            style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(product._id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* ─── TRANSACTIONS ─── */}
        {activeTab === 'transactions' && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>🔄 My Transactions</h2>
              <button className="btn-toggle" onClick={fetchTransactions} style={{ fontSize: '13px' }}>
                ↻ Refresh
              </button>
            </div>

            {/* Points explainer */}
            <div className="tx-points-explainer">
              <div className="tx-pe-item"><span className="tx-pe-pts">+10 pts</span><span>for donating an item (seller — after both confirm)</span></div>
              <div className="tx-pe-item"><span className="tx-pe-pts">+5 pts</span><span>for collecting an item (buyer — after both confirm)</span></div>
            </div>

            {txLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#5A5A56' }}>Loading transactions…</div>
            ) : txError ? (
              <div className="error-banner">{txError}</div>
            ) : transactions.length === 0 ? (
              <p className="empty-state">No transactions yet. Browse the marketplace to request items!</p>
            ) : (
              <div className="tx-list">
                {transactions.map(tx => {
                  const iAmBuyer  = isMe(tx.buyer?._id);
                  const iAmSeller = isMe(tx.seller?._id);
                  const status = txStatusInfo(tx);

                  const canConfirmBuyer  = iAmBuyer  && tx.status === 'accepted' && !tx.buyerConfirmed;
                  const canConfirmSeller = iAmSeller && tx.status === 'accepted' && !tx.sellerConfirmed;
                  const myConfirmed = iAmBuyer ? tx.buyerConfirmed : tx.sellerConfirmed;

                  return (
                    <div key={tx._id} className={`tx-card ${tx.status === 'completed' ? 'tx-card-done' : ''}`}>
                      <div className="tx-card-header">
                        <div className="tx-product-name">
                          {tx.product?.title || 'Unknown product'}
                        </div>
                        <span className={`tx-status-pill ${status.cls}`}>{status.label}</span>
                      </div>

                      <div className="tx-card-meta">
                        <span>
                          {iAmBuyer
                            ? <>Seller: <strong>{tx.seller?.name}</strong></>
                            : <>Buyer: <strong>{tx.buyer?.name}</strong></>}
                        </span>
                        <span className="tx-role-chip">
                          {iAmBuyer ? '🛒 You are the Buyer' : '📦 You are the Seller'}
                        </span>
                        <span style={{ color: '#9A9A96', fontSize: '12px' }}>
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Dual-confirm progress */}
                      {tx.status === 'accepted' && (
                        <div className="tx-confirm-row">
                          <div className={`tx-confirm-badge ${tx.sellerConfirmed ? 'confirmed' : ''}`}>
                            {tx.sellerConfirmed ? '✔' : '○'} Seller confirmed
                          </div>
                          <div className={`tx-confirm-badge ${tx.buyerConfirmed ? 'confirmed' : ''}`}>
                            {tx.buyerConfirmed ? '✔' : '○'} Buyer confirmed
                          </div>
                        </div>
                      )}

                      {tx.status === 'completed' && (
                        <div className="tx-completed-banner">
                          🌱 Transaction complete! Points have been awarded.
                        </div>
                      )}

                      {/* Action button */}
                      {(canConfirmBuyer || canConfirmSeller) && (
                        <button
                          id={`confirm-tx-${tx._id}`}
                          className="tx-confirm-btn"
                          disabled={confirmingTxId === tx._id}
                          onClick={() => handleTxConfirm(tx._id, iAmBuyer ? 'buyer' : 'seller')}
                        >
                          {confirmingTxId === tx._id
                            ? 'Saving…'
                            : iAmBuyer ? '✅ Confirm I received this item' : '✅ Confirm I handed over this item'}
                        </button>
                      )}

                      {tx.status === 'accepted' && myConfirmed && !tx.status === 'completed' && (
                        <p className="tx-waiting-msg">
                          ⏳ Waiting for the {iAmBuyer ? 'seller' : 'buyer'} to confirm…
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─── MESSAGES ─── */}
        {activeTab === 'messages' && <UserMessages />}

        {/* ─── PROFILE ─── */}
        {activeTab === 'profile' && (
          <div className="profile-grid">
            {/* Profile Overview Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section className="dashboard-section profile-card-left">
                <h2>Profile Overview</h2>
                <div className="profile-avatar-container">
                  <div className="profile-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h3>{user?.name}</h3>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                    <span className="badge-tier-chip">{badge.icon} {badge.name}</span>
                    <span className={`profile-status-badge ${user?.status === 'suspended' ? 'status-suspended' : 'status-active'}`}>
                      {user?.status === 'suspended' ? '🔴 Suspended' : '🟢 Active'}
                    </span>
                  </div>
                </div>

                {user?.bio && (
                  <div className="profile-bio-preview">
                    <p>"{user.bio}"</p>
                  </div>
                )}

                <div className="profile-details-list">
                  <div className="detail-item">
                    <span className="detail-label">Email Address</span>
                    <span className="detail-value">{user?.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{user?.phone || 'Not set'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>

                  <div className="points-breakdown">
                    <div className="pb-item">
                      <span className="pb-icon">🛒</span>
                      <div className="pb-info">
                        <span className="pb-lbl">Marketplace Listings</span>
                        <span className="pb-val">{myMarketplaceCount} items</span>
                      </div>
                    </div>
                    <div className="pb-item">
                      <span className="pb-icon">♻️</span>
                      <div className="pb-info">
                        <span className="pb-lbl">Recycling Donations</span>
                        <span className="pb-val">{myRecyclingCount} items</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points Progress */}
                <div className="points-section">
                  <div className="points-header">
                    <span className="detail-label">⭐ Total Points</span>
                    <span className="points-value" style={{ color: '#1E9B6B', fontWeight: 'bold' }}>
                      {currentPoints} pts
                    </span>
                  </div>
                  <div className="points-progress-bar">
                    <div className="points-progress-fill" style={{ width: `${pointsProgress}%` }} />
                  </div>
                  {badge.next ? (
                    <p className="points-hint">
                      {badge.nextThreshold - currentPoints} more pts to unlock {badge.next} badge
                    </p>
                  ) : (
                    <div className="topfan-earned">
                      🌍 You have reached the highest tier!
                    </div>
                  )}

                  {/* Badge ladder */}
                  <div className="badge-ladder">
                    {[
                      { name: 'Eco Starter', icon: '🌱', min: 0   },
                      { name: 'Green Hero',  icon: '🌿', min: 25  },
                      { name: 'Top Fan',     icon: '🏆', min: 75  },
                      { name: 'Eco Champion',icon: '🌍', min: 150 },
                    ].map(tier => (
                      <div
                        key={tier.name}
                        className={`badge-ladder-item ${currentPoints >= tier.min ? 'unlocked' : 'locked'}`}
                      >
                        <span className="badge-ladder-icon">{tier.icon}</span>
                        <span className="badge-ladder-name">{tier.name}</span>
                        <span className="badge-ladder-min">{tier.min === 0 ? 'Start' : `${tier.min}+`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Edit Profile Form */}
            <section className="dashboard-section profile-edit-right" style={{ height: 'fit-content' }}>
              <h2>Edit Profile Information</h2>
              {profileSuccess && (
                <div className="success-banner" style={{ background: '#E8F5EF', color: '#1E9B6B', padding: '12px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #1E9B6B' }}>
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="error-message" style={{ color: '#D45A2A', marginBottom: '20px' }}>
                  {profileError}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="e.g. +94 77 123 4567"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={profileAddress}
                    onChange={e => setProfileAddress(e.target.value)}
                    placeholder="Enter your home address"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>About Me <span style={{ color: '#888', fontWeight: 400, fontSize: '13px' }}>(optional)</span></label>
                  <textarea
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    placeholder="Tell others a little about yourself..."
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn-submit" disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>

      {/* ── Edit Product Modal ── */}
      {editingProduct && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h2>Edit Product</h2>
            <form onSubmit={handleUpdateProduct}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                >
                  <option value="furniture">Furniture</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="tools">Tools &amp; Hardware</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="text"
                  value={editingProduct.price || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-submit" style={{ flex: 1, background: '#4CAF50', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Update</button>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, background: '#f44336', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
