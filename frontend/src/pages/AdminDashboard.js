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
          Users ({users.length})
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
            {users.length === 0 ? (
              <p className="empty-state">No users found.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
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
    </div>
  );
}
