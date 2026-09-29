import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, messageAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import UserMessages from './UserMessages';
import './Dashboard.css';

export default function CompanyDashboard() {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab control
  const [activeTab, setActiveTab] = useState('listings');

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [expiredProducts, setExpiredProducts] = useState([]);
  const [expiredLoading, setExpiredLoading] = useState(false);

  // Expired item detail modal
  const [selectedExpiredProduct, setSelectedExpiredProduct] = useState(null);
  const [modalMsgBody, setModalMsgBody] = useState('');
  const [modalMsgLoading, setModalMsgLoading] = useState(false);
  const [modalMsgSuccess, setModalMsgSuccess] = useState('');
  const [modalMsgError, setModalMsgError] = useState('');

  // Recycling center posts ("Contact Recycling Center" listings)
  const [recyclingProducts, setRecyclingProducts] = useState([]);
  const [recyclingLoading, setRecyclingLoading] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);

  // Sync profile form state when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.address || '');
      setProfileBio(user.bio || '');
      setProfileWebsite(user.website || '');
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
    fetchExpiredProducts();
    fetchRecyclingListings();
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

  const fetchExpiredProducts = async () => {
    try {
      setExpiredLoading(true);
      const response = await productAPI.getExpired();
      setExpiredProducts(response.data.data);
    } catch (err) {
      console.error('Failed to fetch expired products:', err);
    } finally {
      setExpiredLoading(false);
    }
  };

  const fetchRecyclingListings = async () => {
    try {
      setRecyclingLoading(true);
      const response = await productAPI.getRecycling();
      setRecyclingProducts(response.data.data);
    } catch (err) {
      console.error('Failed to fetch recycling listings:', err);
    } finally {
      setRecyclingLoading(false);
    }
  };

  // ── Expired item modal message sender ──────────────────────────────────
  const openExpiredModal = (product) => {
    setSelectedExpiredProduct(product);
    setModalMsgBody('');
    setModalMsgSuccess('');
    setModalMsgError('');
  };

  const closeExpiredModal = () => {
    setSelectedExpiredProduct(null);
    setModalMsgBody('');
    setModalMsgSuccess('');
    setModalMsgError('');
  };

  const handleModalSendMessage = async (e) => {
    e.preventDefault();
    if (!modalMsgBody.trim()) {
      setModalMsgError('Message cannot be empty.');
      return;
    }
    setModalMsgLoading(true);
    setModalMsgSuccess('');
    setModalMsgError('');
    try {
      await messageAPI.sendMessage(
        selectedExpiredProduct.user._id,
        `Recycling Pickup: ${selectedExpiredProduct.title}`,
        modalMsgBody
      );
      setModalMsgSuccess('Message sent! The owner will be notified.');
      setModalMsgBody('');
    } catch (err) {
      setModalMsgError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setModalMsgLoading(false);
    }
  };

  // ── Dual-Confirmation: Collector claims an item ──────────────────────────
  const handleClaimCollection = async (productId) => {
    if (!window.confirm('Confirm that you have collected this item?')) return;
    try {
      const res = await productAPI.claimCollection(productId);
      if (res.data.success) {
        alert(res.data.message);
        fetchRecyclingListings();
        fetchExpiredProducts();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to claim collection');
    }
  };

  const handleConfirmCollector = async (productId) => {
    if (!window.confirm('Confirm that you completed the pickup?')) return;
    try {
      setConfirmingId(productId);
      const res = await productAPI.confirmCollector(productId);
      alert(res.data.message || 'Collector confirmation saved');
      fetchRecyclingListings();
      fetchExpiredProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to confirm pickup');
    } finally {
      setConfirmingId(null);
    }
  };

  const [editingProduct, setEditingProduct] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await productAPI.delete(id);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete listing');
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
      setError('Failed to update listing');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);
    try {
      const res = await updateUserProfile(profileName, profilePhone, profileAddress, profileBio, profileWebsite);
      if (res.success) {
        setProfileSuccess('Company profile updated successfully!');
      } else {
        setProfileError(res.error);
      }
    } catch (err) {
      setProfileError('Failed to update company profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const myProducts = products.filter(p => p.user && p.user._id === user?._id);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1>Welcome, {user?.name}!</h1>
          <span className="badge-recycler">
            ♻️ Verified Partner
          </span>
        </div>
        <p>Manage your recycling offers, browse listings, and update company details</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          Company Listings
        </button>
        <button
          className={`tab-btn ${activeTab === 'recycling' ? 'active' : ''}`}
          onClick={() => setActiveTab('recycling')}
        >
          ♻️ Recycling Requests
        </button>
        <button
          className={`tab-btn ${activeTab === 'recycling-expired' ? 'active' : ''}`}
          onClick={() => setActiveTab('recycling-expired')}
        >
          ⏰ Expired Items
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
          Company Profile
        </button>
      </div>

      <div className="dashboard-content" style={{ marginTop: '20px' }}>
        {activeTab === 'listings' ? (
          <>
            <section className="dashboard-section">
              <div className="section-header">
                <h2>Upload New Offer/Ad</h2>
                <button
                  className="btn-toggle"
                  onClick={() => window.location.href = '/post'}
                >
                  + Post Ad
                </button>
              </div>
            </section>

            <section className="dashboard-section">
              <h2>My Company Listings ({myProducts.length})</h2>
              {myProducts.length === 0 ? (
                <p className="empty-state">Your company hasn't uploaded any listings yet.</p>
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
                          style={{ background: '#2A76D4', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
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

            <section className="dashboard-section">
              <h2>All Available Products ({products.length})</h2>
              {loading ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p className="empty-state">No products available yet.</p>
              ) : (
                <div className="products-grid">
                  {products.map(product => (
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
                      <p className="product-user">By: {product?.user?.name || 'Unknown User'}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : activeTab === 'recycling' ? (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Recycling Center Requests ({recyclingProducts.length})</h2>
              <button className="btn-toggle" onClick={fetchRecyclingListings}>
                🔄 Refresh
              </button>
            </div>
            <p style={{ color: 'var(--ink2)', marginBottom: '20px' }}>
              These items were posted by donors using "Contact Recycling Center". Claim an item to confirm collection.
            </p>
            {recyclingLoading ? (
              <p>Loading recycling requests...</p>
            ) : recyclingProducts.length === 0 ? (
              <p className="empty-state">No recycling requests at the moment.</p>
            ) : (
              <div className="products-grid">
                {recyclingProducts.map(product => {
                  const isClaimed = !!product.collectedBy;
                  const isClaimedByMe = product.collectedBy && (
                    (typeof product.collectedBy === 'string' && product.collectedBy === user?._id) ||
                    (product.collectedBy._id === user?._id)
                  );
                  const isCompleted = product.status === 'completed';
                  const isPending = product.status === 'pending_collection';

                  return (
                    <div key={product._id} className="product-card" style={{ borderLeft: `4px solid ${isCompleted ? '#1E9B6B' : isPending ? '#F5A623' : '#2A76D4'}` }}>
                      <div className="product-header">
                        <h3>{product.title}</h3>
                        <span className="category-badge">{product.category}</span>
                      </div>
                      <p className="product-desc">{product.description}</p>
                      <p className="product-date">
                        Posted: {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                      <p className="product-user">
                        Donor: {product?.user?.name || 'Unknown'} ({product?.user?.email || 'No email'})
                      </p>
                      {product.location && (
                        <p style={{ fontSize: '12px', color: 'var(--ink2)' }}>📍 {product.location}</p>
                      )}

                      {/* Status + Action */}
                      <div style={{ marginTop: '12px' }}>
                        {isCompleted ? (
                          <span style={{ display: 'inline-block', background: '#E8F5EF', color: '#1E9B6B', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                            ✅ Completed
                          </span>
                        ) : isPending && isClaimedByMe ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ display: 'inline-block', background: '#FBF0DA', color: '#C88A15', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                              🟡 Awaiting Donor Confirmation
                            </span>
                            <button
                              onClick={() => handleConfirmCollector(product._id)}
                              disabled={confirmingId === product._id}
                              style={{
                                background: '#2A76D4',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '13px'
                              }}
                            >
                              {confirmingId === product._id ? 'Saving...' : 'Confirm Pickup'}
                            </button>
                          </div>
                        ) : isPending && !isClaimedByMe ? (
                          <span style={{ display: 'inline-block', background: '#F0F0F0', color: '#888', padding: '6px 14px', borderRadius: '20px', fontSize: '13px' }}>
                            Claimed by another collector
                          </span>
                        ) : (
                          <button
                            onClick={() => handleClaimCollection(product._id)}
                            style={{
                              background: '#1E9B6B',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '13px'
                            }}
                          >
                            🚚 Claim & Confirm Collection
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : activeTab === 'recycling-expired' ? (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Expired Items for Recycling ({expiredProducts.length})</h2>
              <button className="btn-toggle" onClick={fetchExpiredProducts}>
                🔄 Refresh List
              </button>
            </div>
            <p style={{ color: 'var(--ink2)', marginBottom: '20px' }}>
              These items are over 30 days old, removed from public browsing, and automatically routed to you for recycling collection.
            </p>
            {expiredLoading ? (
              <p>Loading recyclable items...</p>
            ) : expiredProducts.length === 0 ? (
              <p className="empty-state">No recyclable items available at this moment.</p>
            ) : (
              <div className="products-grid">
                {expiredProducts.map(product => (
                  <div key={product._id} className="product-card" style={{ borderLeft: '4px solid var(--amber)' }}>
                    <div className="product-header">
                      <h3>{product.title}</h3>
                      <span className="category-badge">{product.category}</span>
                    </div>
                    <p className="product-desc">{product.description}</p>
                    <p className="product-date">
                      Expired on: {new Date(product.expiresAt).toLocaleDateString()}
                    </p>
                    <p className="product-user">
                      Owner: {product?.user?.name || 'Unknown User'} ({product?.user?.email || 'No email'})
                    </p>
                    <div style={{ marginTop: '12px' }}>
                      <button
                        onClick={() => openExpiredModal(product)}
                        style={{
                          background: 'var(--g, #1E9B6B)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          width: '100%',
                          marginTop: '4px'
                        }}
                      >
                        📋 View Details &amp; Contact Owner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : activeTab === 'messages' ? (
          <UserMessages />

        ) : (
          <div className="profile-grid">
            {/* Company Details Card */}
            <section className="dashboard-section profile-card-left company-profile-card">
              <h2>Company Details</h2>
              <div className="profile-avatar-container">
                <div className="profile-avatar company-avatar">
                  🏢
                </div>
                <h3>{user?.name}</h3>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                  <span className="role-badge role-admin" style={{ background: '#E8F0FB', color: '#2A76D4' }}>Recycler</span>
                  <span className={`profile-status-badge ${user?.status === 'suspended' ? 'status-suspended' : 'status-active'}`}>
                    {user?.status === 'suspended' ? '🔴 Suspended' : '🟢 Active'}
                  </span>
                </div>
              </div>

              {/* Company Bio preview */}
              {user?.bio && (
                <div className="profile-bio-preview company-bio">
                  <p>"{user.bio}"</p>
                </div>
              )}

              <div className="profile-details-list">
                <div className="detail-item">
                  <span className="detail-label">Business Email</span>
                  <span className="detail-value">{user?.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Phone</span>
                  <span className="detail-value">{user?.phone || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Facility Address</span>
                  <span className="detail-value">{user?.address || 'Not specified'}</span>
                </div>
                {user?.website && (
                  <div className="detail-item">
                    <span className="detail-label">Website</span>
                    <a
                      href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="company-website-link"
                    >
                      🔗 {user.website}
                    </a>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Partner Since</span>
                  <span className="detail-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Active Listings</span>
                  <span className="detail-value" style={{ color: '#2A76D4', fontWeight: 'bold' }}>
                    📦 {myProducts.length}
                  </span>
                </div>
              </div>
            </section>

            {/* Edit Company Profile Form */}
            <section className="dashboard-section profile-edit-right">
              <h2>Edit Company Information</h2>
              {profileSuccess && <div className="success-banner" style={{ background: '#E8F5EF', color: '#1E9B6B', padding: '12px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #1E9B6B' }}>{profileSuccess}</div>}
              {profileError && <div className="error-message" style={{ color: '#D45A2A', marginBottom: '20px' }}>{profileError}</div>}

              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="e.g. +94 11 234 5678"
                  />
                </div>
                <div className="form-group">
                  <label>Facility Address</label>
                  <textarea
                    value={profileAddress}
                    onChange={e => setProfileAddress(e.target.value)}
                    placeholder="Full facility location"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Website <span style={{ color: '#888', fontWeight: 400, fontSize: '13px' }}>(optional)</span></label>
                  <input
                    type="text"
                    value={profileWebsite}
                    onChange={e => setProfileWebsite(e.target.value)}
                    placeholder="e.g. https://yourcompany.com"
                  />
                </div>
                <div className="form-group">
                  <label>Company Description <span style={{ color: '#888', fontWeight: 400, fontSize: '13px' }}>(optional)</span></label>
                  <textarea
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    placeholder="Describe your company, recycling services, and what you accept..."
                    rows="4"
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

      {/* ── Expired Item Detail & Contact Modal ───────────────────────────── */}
      {selectedExpiredProduct && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeExpiredModal(); }}
        >
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 24px 16px', borderBottom: '1px solid #eee' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ background: '#FFF3CD', color: '#856404', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⏰ Expired — Ready for Recycling</span>
                  <span style={{ background: '#E8F5EF', color: '#1E9B6B', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>{selectedExpiredProduct.category}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#1A1A18' }}>{selectedExpiredProduct.title}</h2>
              </div>
              <button
                onClick={closeExpiredModal}
                style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', fontSize: '18px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Product Image */}
              {selectedExpiredProduct.imageUrl && (
                <div style={{ borderRadius: '10px', overflow: 'hidden', maxHeight: '240px' }}>
                  <img
                    src={selectedExpiredProduct.imageUrl}
                    alt={selectedExpiredProduct.title}
                    style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}

              {/* Description */}
              <div style={{ background: '#F9F9F7', borderRadius: '10px', padding: '16px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#888', letterSpacing: '0.5px' }}>Description</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: 1.6 }}>{selectedExpiredProduct.description}</p>
              </div>

              {/* Item Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: '📅 Expired On', value: new Date(selectedExpiredProduct.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: '📅 Originally Posted', value: new Date(selectedExpiredProduct.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: '💰 Listed Price', value: selectedExpiredProduct.price === 'Free' ? 'Free' : `$${selectedExpiredProduct.price}` },
                  { label: '📍 Location', value: selectedExpiredProduct.location || 'Not specified' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#F9F9F7', borderRadius: '8px', padding: '12px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1A1A18' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Owner Contact Card */}
              <div style={{ background: '#E8F5EF', border: '1px solid #C3E6D8', borderRadius: '10px', padding: '16px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#1E9B6B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>👤 Item Owner</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '14px', color: '#555' }}>Name</span>
                    <strong style={{ fontSize: '14px', color: '#1A1A18' }}>{selectedExpiredProduct.user?.name || 'Unknown'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '14px', color: '#555' }}>📧 Email</span>
                    <a href={`mailto:${selectedExpiredProduct.user?.email}`} style={{ fontSize: '14px', color: '#1E9B6B', fontWeight: 600, textDecoration: 'none' }}>{selectedExpiredProduct.user?.email || 'Not available'}</a>
                  </div>
                  {selectedExpiredProduct.user?.phone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#555' }}>📞 Phone</span>
                      <a href={`tel:${selectedExpiredProduct.user.phone}`} style={{ fontSize: '14px', color: '#1E9B6B', fontWeight: 600, textDecoration: 'none' }}>{selectedExpiredProduct.user.phone}</a>
                    </div>
                  )}
                  {selectedExpiredProduct.user?.address && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontSize: '14px', color: '#555' }}>📍 Address</span>
                      <span style={{ fontSize: '14px', color: '#1A1A18', fontWeight: 600, textAlign: 'right' }}>{selectedExpiredProduct.user.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* In-Dashboard Message Form */}
              <div style={{ background: '#F5F5F3', borderRadius: '10px', padding: '16px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💬 Send a Message to Owner</p>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>Arrange a pickup time, ask about the item condition, or discuss recycling logistics.</p>

                {modalMsgSuccess && (
                  <div style={{ background: '#E8F5EF', color: '#1E9B6B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '12px', borderLeft: '3px solid #1E9B6B' }}>
                    ✅ {modalMsgSuccess}
                  </div>
                )}
                {modalMsgError && (
                  <div style={{ background: '#FAECE5', color: '#D45A2A', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '12px', borderLeft: '3px solid #D45A2A' }}>
                    ⚠️ {modalMsgError}
                  </div>
                )}

                <form onSubmit={handleModalSendMessage}>
                  <div style={{ marginBottom: '10px', background: '#fff', borderRadius: '6px', padding: '10px 12px', border: '1px solid #ddd', fontSize: '13px', color: '#888' }}>
                    <strong style={{ color: '#555' }}>Subject:</strong> Recycling Pickup: {selectedExpiredProduct.title}
                  </div>
                  <textarea
                    value={modalMsgBody}
                    onChange={(e) => setModalMsgBody(e.target.value)}
                    placeholder="Hi, we are interested in collecting this item for recycling. Can we arrange a pickup at..."
                    rows={4}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                  <button
                    type="submit"
                    disabled={modalMsgLoading}
                    style={{ marginTop: '10px', background: '#1E9B6B', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: modalMsgLoading ? 'not-allowed' : 'pointer', opacity: modalMsgLoading ? 0.7 : 1, width: '100%' }}
                  >
                    {modalMsgLoading ? '⏳ Sending...' : '📨 Send Message'}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h2>Edit Product Listing</h2>
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
                <button type="submit" className="btn-submit" style={{ flex: 1, background: '#2A76D4', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Update</button>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, background: '#f44336', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
