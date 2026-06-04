import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../utils/api';
import './ProductListing.css';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await API.product.getAll();
      setProducts(response.data.data);
      setFilteredProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.category === category)
      );
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = products.filter((p) =>
      p.title.toLowerCase().includes(term.toLowerCase()) ||
      p.description.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const toggleSave = (productId) => {
    if (savedItems.includes(productId)) {
      setSavedItems(savedItems.filter((id) => id !== productId));
    } else {
      setSavedItems([...savedItems, productId]);
    }
  };

  const categories = [
    { id: 'all', label: 'All Categories', icon: '🏷️' },
    { id: 'furniture', label: 'Furniture', icon: '🪑' },
    { id: 'electronics', label: 'Electronics', icon: '📱' },
    { id: 'clothing', label: 'Clothing', icon: '👕' },
    { id: 'tools', label: 'Tools', icon: '🔧' },
  ];

  return (
    <section className="listings-sec" id="browse">
      <div className="wrap">
        <div className="sec-kicker">
          <span className="chip chip-g">🛍️ Browse</span>
        </div>
        <h2 className="sec-title">Featured Listings</h2>
        <p className="sec-sub">
          Discover items from your community. Free or affordable prices.
        </p>

        {/* Filter Bar */}
        <div className="filter-bar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`fb ${selectedCategory === cat.id ? 'on' : ''}`}
              onClick={() => handleFilter(cat.id)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
          <div className="fsearch">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <span style={{ fontSize: '14px' }}>🔍</span>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="listings-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="lcard"
              >
                <div className="lcard-img">
                  <div
                    className="ci"
                    style={{
                      background: ['#E8F5EF', '#E8F0FB', '#FBF0DA', '#FAECE5'][
                        Math.floor(Math.random() * 4)
                      ],
                    }}
                  >
                    {product.icon || '📦'}
                  </div>
                  <button
                    className="lcard-save"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSave(product._id);
                    }}
                  >
                    {savedItems.includes(product._id) ? '❤️' : '🤍'}
                  </button>
                  <div className="cond-badge">
                    <span className={`chip chip-${product.price === 'Free' ? 'g' : 'a'}`}>
                      {product.price === 'Free' ? 'Free' : 'Paid'}
                    </span>
                  </div>
                </div>
                <div className="lcard-body">
                  <h3 className="lcard-title">{product.title}</h3>
                  <p className="lcard-meta">
                    📍 {product.location || 'Sri Lanka'}
                  </p>
                  <div className="lcard-foot">
                    <span className="price price-free">
                      {product.price || 'Contact'}
                    </span>
                    <div className="pts-badge">⭐ +10 pts</div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '16px', color: 'var(--ink2)' }}>
                No items found. Try a different search!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductListing;
