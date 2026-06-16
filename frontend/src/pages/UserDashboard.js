import React, { useState, useEffect, useContext } from 'react';
import { productAPI, userAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import UserMessages from './UserMessages';
import './Dashboard.css';

export default function UserDashboard() {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab control
  const [activeTab, setActiveTab] = useState('listings');

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync profile form state when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.address || '');
      setProfileBio(user.bio || '');
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
    fetchLeaderboard();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data.data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await userAPI.getLeaderboard();
      setLeaderboard(response.data.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard');
    }
  };

  const [editingProduct, setEditingProduct] = useState(null);

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

  const myProducts = products.filter(p => p.user && p.user._id === user?._id);
  const myMarketplaceCount = myProducts.filter(p => p.listingType !== 'recycling').length;
  const myRecyclingCount = myProducts.filter(p => p.listingType === 'recycling').length;

  const currentPoints = user?.points || 0;
  
  // Badge Logic
  let badgeName = 'Eco Starter';
  let badgeIcon = '🌱';
  let nextBadge = 'Green Hero';
  let nextThreshold = 25;
  
  if (currentPoints >= 150) {
    badgeName = 'Eco Champion';
    badgeIcon = '🌍';
    nextBadge = null;
    nextThreshold = 150;
  } else if (currentPoints >= 75) {
    badgeName = 'Top Fan';
    badgeIcon = '🏆';
    nextBadge = 'Eco Champion';
    nextThreshold = 150;
  } else if (currentPoints >= 25) {
    badgeName = 'Green Hero';
    badgeIcon = '🌿';
    nextBadge = 'Top Fan';
    nextThreshold = 75;
  }
  
  const prevThreshold = nextThreshold === 25 ? 0 : (nextThreshold === 75 ? 25 : (nextThreshold === 150 ? 75 : 150));
  const pointsInCurrentTier = currentPoints - prevThreshold;
  const tierSize = nextThreshold - prevThreshold;
  const pointsProgress = nextBadge ? Math.min((pointsInCurrentTier / tierSize) * 100, 100) : 100;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1>Welcome, {user?.name}!</h1>
          <span className="badge-tier-chip">
            {badgeIcon} {badgeName}
          </span>
        </div>
        <p>Manage your items, check rewards, and update your settings</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          My Listings
        </button>
        <button
          className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages
        </button>

        <button
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
        {activeTab === 'listings' ? (
          <>
            <section className="dashboard-section">
              <div className="section-header">
                <h2>Upload New Product</h2>
                <button
                  className="btn-toggle"
                  onClick={() => window.location.href = '/post'}
                >
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
                  {myProducts.map(product => (
                    <div key={product._id} className="product-card">
                      <div className="product-header">
                        <h3>{product.title}</h3>
                        <span className="category-badge">{product.category}</span>
                      </div>
                      <p className="product-desc">{product.description}</p>
                      {product.price && <p className="product-price">${product.price}</p>}
                      <p className="product-date">
                        Posted: {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          className="btn-edit-sm"
                          onClick={() => setEditingProduct(product)}
                          style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : activeTab === 'messages' ? (
          <UserMessages />
        ) : (
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
                    <span className="badge-tier-chip">{badgeIcon} {badgeName}</span>
                    <span className={`profile-status-badge ${user?.status === 'suspended' ? 'status-suspended' : 'status-active'}`}>
                      {user?.status === 'suspended' ? '🔴 Suspended' : '🟢 Active'}
                    </span>
                  </div>
                </div>

                {/* Bio preview */}
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
                    <div
                      className="points-progress-fill"
                      style={{ width: `${pointsProgress}%` }}
                    />
                  </div>
                  {nextBadge ? (
                    <p className="points-hint">
                      {nextThreshold - currentPoints} more pts to unlock {nextBadge} badge
                    </p>
                  ) : (
                    <div className="topfan-earned">
                      🌍 You have reached the highest tier!
                    </div>
                  )}
                </div>
              </section>

              {/* How Points Work Card */}
              <section className="dashboard-section hpw-card">
                <h3>ℹ️ How Points Work</h3>
                <p>Earn points by contributing to the community and unlocking badges!</p>
                <ul className="hpw-list">
                  <li><strong>+5 pts</strong> for posting a marketplace listing</li>
                  <li><strong>+20 pts</strong> for a direct recycling donation</li>
                  <li><strong>+5 pts</strong> bonus for uploading an item photo</li>
                </ul>
                <div className="hpw-badges">
                  <div className="hpw-badge"><span>🌱 Eco Starter</span> <small>0-24 pts</small></div>
                  <div className="hpw-badge"><span>🌿 Green Hero</span> <small>25-74 pts</small></div>
                  <div className="hpw-badge"><span>🏆 Top Fan</span> <small>75-149 pts</small></div>
                  <div className="hpw-badge"><span>🌍 Eco Champion</span> <small>150+ pts</small></div>
                </div>
              </section>
            </div>

            {/* Edit Profile Form */}
            <section className="dashboard-section profile-edit-right" style={{ height: 'fit-content' }}>
              <h2>Edit Profile Information</h2>
              {profileSuccess && <div className="success-banner" style={{ background: '#E8F5EF', color: '#1E9B6B', padding: '12px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #1E9B6B' }}>{profileSuccess}</div>}
              {profileError && <div className="error-message" style={{ color: '#D45A2A', marginBottom: '20px' }}>{profileError}</div>}

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

      {/* Edit Product Modal */}
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
                  onChange={e => setEditingProduct({...editingProduct, title: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                >
                  <option value="furniture">Furniture</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="tools">Tools & Hardware</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="text"
                  value={editingProduct.price || ''}
                  onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
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
