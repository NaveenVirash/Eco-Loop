import React, { useState, useEffect } from 'react';
import { userAPI, productAPI } from '../utils/api';
import './Dashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState('');

  // Profile modal
  const [profileModal, setProfileModal] = useState(null); // holds the user object to view
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, productsRes] = await Promise.all([
        userAPI.getAll(),
        productAPI.getAll()
      ]);
      setUsers(usersRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'suspend' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this account?`)) {
      try {
        await userAPI.updateStatus(id, newStatus);
        setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
        // Also update profile modal if it's the same user
        if (profileModal && profileModal._id === id) {
          setProfileModal(prev => ({ ...prev, status: newStatus }));
        }
      } catch (err) {
        setError('Failed to update status');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userAPI.delete(id);
        setUsers(users.filter(u => u._id !== id));
        if (profileModal && profileModal._id === id) setProfileModal(null);
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const handleViewProfile = async (userObj) => {
    setProfileLoading(true);
    setProfileModal(userObj);
    try {
      const res = await userAPI.getProfile(userObj._id);
      setProfileModal(res.data.data);
    } catch (err) {
      // fallback to what we already have
    } finally {
      setProfileLoading(false);
    }
  };

  const regularUsers = users.filter(u => u.role === 'user' || u.role === 'admin');
  const companies = users.filter(u => u.role === 'company');

  const getUserListingCount = (userId) => products.filter(p => p.user?._id === userId).length;

  const [editingProduct, setEditingProduct] = useState(null);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await productAPI.update(editingProduct._id, {
        title: editingProduct.title,
        category: editingProduct.category,
        description: editingProduct.description,
        price: editingProduct.price,
      });
      setProducts(products.map(p => p._id === editingProduct._id ? res.data.data : p));
      setEditingProduct(null);
    } catch (err) {
      setError('Failed to update product');
    }
  };

  const isCompany = profileModal?.role === 'company';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, companies, and products</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Summary Stats */}
      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <span className="stat-number">{regularUsers.length}</span>
          <span className="stat-label">👤 Users</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-number">{companies.length}</span>
          <span className="stat-label">🏢 Companies</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-number">{products.length}</span>
          <span className="stat-label">📦 Products</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-number stat-suspended">
            {users.filter(u => u.status === 'suspended').length}
          </span>
          <span className="stat-label">🔴 Suspended</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👤 Users ({regularUsers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
          onClick={() => setActiveTab('companies')}
        >
          🏢 Companies ({companies.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products ({products.length})
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <p>Loading data...</p>
        ) : activeTab === 'users' ? (
          <section className="admin-section">
            <h2>Users Management</h2>
            {regularUsers.length === 0 ? (
              <p className="empty-state">No users found.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Points</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regularUsers.map(user => (
                      <tr key={user._id}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${user.status === 'suspended' ? 'suspended' : 'active'}`}>
                            {user.status === 'suspended' ? '🔴 Suspended' : '🟢 Active'}
                          </span>
                        </td>
                        <td>⭐ {user.points || 0}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="admin-actions-cell">
                          <button
                            className="btn-admin-view"
                            onClick={() => handleViewProfile(user)}
                          >
                            View
                          </button>
                          <button
                            className={`btn-admin-status ${user.status === 'suspended' ? 'btn-activate' : 'btn-suspend'}`}
                            onClick={() => handleToggleStatus(user._id, user.status || 'active')}
                          >
                            {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            className="btn-delete-sm"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : activeTab === 'companies' ? (
          <section className="admin-section">
            <h2>Companies Management</h2>
            {companies.length === 0 ? (
              <p className="empty-state">No companies found.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Listings</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(company => (
                      <tr key={company._id}>
                        <td><strong>🏢 {company.name}</strong></td>
                        <td>{company.email}</td>
                        <td>{company.phone || '-'}</td>
                        <td>
                          <span className={`status-badge status-${company.status === 'suspended' ? 'suspended' : 'active'}`}>
                            {company.status === 'suspended' ? '🔴 Suspended' : '🟢 Active'}
                          </span>
                        </td>
                        <td>📦 {getUserListingCount(company._id)}</td>
                        <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                        <td className="admin-actions-cell">
                          <button
                            className="btn-admin-view"
                            onClick={() => handleViewProfile(company)}
                          >
                            View
                          </button>
                          <button
                            className={`btn-admin-status ${company.status === 'suspended' ? 'btn-activate' : 'btn-suspend'}`}
                            onClick={() => handleToggleStatus(company._id, company.status || 'active')}
                          >
                            {company.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                          <button
                            className="btn-delete-sm"
                            onClick={() => handleDeleteUser(company._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="admin-section">
            <h2>Products Management</h2>
            {products.length === 0 ? (
              <p className="empty-state">No products found.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Posted By</th>
                      <th>Posted Date</th>
                      <th>Expires</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => {
                      const createdDate = new Date(product.createdAt);
                      const expiresDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                      const daysLeft = Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={product._id}>
                          <td>{product.title}</td>
                          <td>{product.category}</td>
                          <td>{product.user?.name || 'Unknown User'}</td>
                          <td>{createdDate.toLocaleDateString()}</td>
                          <td>
                            <span className={`days-left ${daysLeft < 7 ? 'warning' : ''}`}>
                              {daysLeft} days
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-edit-sm"
                              onClick={() => setEditingProduct(product)}
                              style={{ marginRight: '8px', background: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-delete-sm"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ===================== VIEW PROFILE MODAL ===================== */}
      {profileModal && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setProfileModal(null); }}
        >
          <div className={`admin-profile-modal ${isCompany ? 'company-modal' : 'user-modal'}`}>
            {/* Modal Header */}
            <div className="apm-header">
              <div className="apm-avatar">
                {isCompany ? '🏢' : (profileModal.name?.charAt(0).toUpperCase() || '?')}
              </div>
              <div className="apm-title">
                <h2>{profileModal.name}</h2>
                <div className="apm-badges">
                  <span className={`role-badge role-${profileModal.role}`}>{profileModal.role}</span>
                  <span className={`profile-status-badge ${profileModal.status === 'suspended' ? 'status-suspended' : 'status-active'}`}>
                    {profileModal.status === 'suspended' ? '🔴 Suspended' : '🟢 Active'}
                  </span>
                  {isCompany && <span className="badge-recycler" style={{ fontSize: '12px', padding: '3px 10px' }}>♻️ Partner</span>}
                  {!isCompany && profileModal.points >= 100 && <span className="badge-topfan" style={{ fontSize: '12px', padding: '3px 10px' }}>🏆 Top Fan</span>}
                </div>
              </div>
              <button className="apm-close" onClick={() => setProfileModal(null)}>✕</button>
            </div>

            {profileLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading profile...</div>
            ) : (
              <>
                {/* Bio / Description */}
                {profileModal.bio && (
                  <div className="apm-bio">
                    <p>"{profileModal.bio}"</p>
                  </div>
                )}

                {/* Profile Details Grid */}
                <div className="apm-details-grid">
                  <div className="apm-detail">
                    <span className="apm-detail-label">📧 Email</span>
                    <span className="apm-detail-value">{profileModal.email}</span>
                  </div>
                  <div className="apm-detail">
                    <span className="apm-detail-label">📱 Phone</span>
                    <span className="apm-detail-value">{profileModal.phone || 'Not provided'}</span>
                  </div>
                  <div className="apm-detail">
                    <span className="apm-detail-label">📍 Address</span>
                    <span className="apm-detail-value">{profileModal.address || 'Not provided'}</span>
                  </div>
                  {isCompany && profileModal.website && (
                    <div className="apm-detail">
                      <span className="apm-detail-label">🔗 Website</span>
                      <a
                        href={profileModal.website.startsWith('http') ? profileModal.website : `https://${profileModal.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="company-website-link"
                      >
                        {profileModal.website}
                      </a>
                    </div>
                  )}
                  {!isCompany && (
                    <div className="apm-detail">
                      <span className="apm-detail-label">⭐ Points</span>
                      <span className="apm-detail-value" style={{ color: '#1E9B6B', fontWeight: 'bold' }}>
                        {profileModal.points || 0} pts
                        {profileModal.points >= 100 && ' 🏆'}
                      </span>
                    </div>
                  )}
                  {isCompany && (
                    <div className="apm-detail">
                      <span className="apm-detail-label">📦 Listings</span>
                      <span className="apm-detail-value" style={{ color: '#2A76D4', fontWeight: 'bold' }}>
                        {getUserListingCount(profileModal._id)}
                      </span>
                    </div>
                  )}
                  <div className="apm-detail">
                    <span className="apm-detail-label">📅 Member Since</span>
                    <span className="apm-detail-value">
                      {profileModal.createdAt ? new Date(profileModal.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Points Progress (for users) */}
                {!isCompany && (
                  <div className="apm-points-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#5A5A56' }}>Top Fan Progress</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1E9B6B' }}>{Math.min(profileModal.points || 0, 100)} / 100</span>
                    </div>
                    <div className="points-progress-bar">
                      <div
                        className="points-progress-fill"
                        style={{ width: `${Math.min(((profileModal.points || 0) / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="apm-actions">
                  <button
                    className={`apm-btn ${profileModal.status === 'suspended' ? 'apm-btn-activate' : 'apm-btn-suspend'}`}
                    onClick={() => handleToggleStatus(profileModal._id, profileModal.status || 'active')}
                  >
                    {profileModal.status === 'suspended' ? '✅ Activate Account' : '⏸ Suspend Account'}
                  </button>
                  <button
                    className="apm-btn apm-btn-delete"
                    onClick={() => handleDeleteUser(profileModal._id)}
                  >
                    🗑 Delete Account
                  </button>
                  <button
                    className="apm-btn apm-btn-close"
                    onClick={() => setProfileModal(null)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===================== EDIT PRODUCT MODAL ===================== */}
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
