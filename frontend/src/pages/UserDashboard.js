import React, { useState, useEffect, useContext } from 'react';
import { productAPI } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

export default function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: ''
  });
  const [error, setError] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productAPI.create(formData);
      setFormData({ title: '', description: '', category: '', price: '' });
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError('Failed to create product');
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

  const myProducts = products.filter(p => p.user._id === user?._id);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Manage your products and view all available items</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="dashboard-content">
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
                  <p className="product-user">By: {product.user.name}</p>
                </div>
              ))}
            </div>
          )}
        </section>
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
