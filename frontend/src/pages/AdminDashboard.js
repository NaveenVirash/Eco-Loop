import React, { useState, useEffect } from 'react';
import { userAPI, productAPI } from '../utils/api';
import './Dashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState('');

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
    if (window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} this account?`)) {
      try {
        await userAPI.updateStatus(id, newStatus);
        setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
      } catch (err) {
        setError(`Failed to update status`);
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const regularUsers = users.filter(u => u.role === 'user' || u.role === 'admin');
  const companies = users.filter(u => u.role === 'company');

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users and products</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({regularUsers.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
          onClick={() => setActiveTab('companies')}
        >
          Companies ({companies.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products ({products.length})
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
                      <th>Joined</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regularUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`role-badge role-${user.status === 'suspended' ? 'admin' : 'user'}`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn-edit-sm"
                            onClick={() => handleToggleStatus(user._id, user.status || 'active')}
                            style={{ marginRight: '8px', background: user.status === 'suspended' ? '#4CAF50' : '#FF9800', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
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
                      <th>Address</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map(company => (
                      <tr key={company._id}>
                        <td>{company.name}</td>
                        <td>{company.email}</td>
                        <td>{company.phone || '-'}</td>
                        <td>{company.address || '-'}</td>
                        <td>
                          <span className={`role-badge role-${company.status === 'suspended' ? 'admin' : 'user'}`}>
                            {company.status || 'active'}
                          </span>
                        </td>
                        <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn-edit-sm"
                            onClick={() => handleToggleStatus(company._id, company.status || 'active')}
                            style={{ marginRight: '8px', background: company.status === 'suspended' ? '#4CAF50' : '#FF9800', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
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
                          <td>{product.user.name}</td>
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

      {editingProduct && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
