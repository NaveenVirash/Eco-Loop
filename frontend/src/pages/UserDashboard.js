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
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : '+ New Product'}
            </button>
          </div>

          {showForm && (
            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Wooden Chair"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the product condition and details"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Toys">Toys</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (Optional)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit">Upload Product</button>
            </form>
          )}
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
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
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
    </div>
  );
}
