import React, { useState, useEffect, useContext } from 'react';
import { productAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
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
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync profile form state when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.address || '');
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
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
      const res = await updateUserProfile(profileName, profilePhone, profileAddress);
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
        ) : (
          <div className="profile-grid">
            <section className="dashboard-section profile-card-left">
              <h2>Company Details</h2>
              <div className="profile-avatar-container">
                <div className="profile-avatar" style={{ background: '#E8F5EF', color: '#1E9B6B' }}>
                  🏢
                </div>
                <h3>{user?.name}</h3>
                <span className="role-badge role-admin" style={{ background: '#E8F0FB', color: '#2A76D4' }}>Recycler</span>
              </div>
              
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
                <div className="detail-item">
                  <span className="detail-label">Partner Since</span>
                  <span className="detail-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </section>

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
                <button type="submit" className="btn-submit" disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>

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
