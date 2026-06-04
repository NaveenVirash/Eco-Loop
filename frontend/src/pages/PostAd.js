import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import './PostAd.css';

const PostAd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    priceType: 'free',
    location: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <section className="post-sec" style={{ paddingTop: '120px', minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 className="sec-title">Please Sign In</h2>
          <p className="sec-sub">
            You need to be logged in to post items.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-g btn-lg"
          >
            Go to Login
          </button>
        </div>
      </section>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.priceType === 'free' ? 'Free' : formData.price);
      data.append('location', formData.location);
      if (formData.image) {
        data.append('image', formData.image);
      }

      await API.product.create(data);

      alert('Product posted successfully!');
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Error posting product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="post-sec" id="post">
      <div className="wrap">
        <div className="post-layout">
          <div className="post-side">
            <h2 className="post-side-title">Share Your Item</h2>
            <p className="post-side-desc">
              Help your community find items they need while earning points and
              building your reputation.
            </p>

            <div className="pts-earn-list">
              <div className="pel-row">
                <span className="pel-act">📸 Upload item photo</span>
                <span className="pel-val">10 pts</span>
              </div>
              <div className="pel-row">
                <span className="pel-act">✏️ Complete listing</span>
                <span className="pel-val">15 pts</span>
              </div>
              <div className="pel-row">
                <span className="pel-act">🔄 Successful exchange</span>
                <span className="pel-val">50 pts</span>
              </div>
            </div>

            <div className="progress-box">
              <h4 className="pb-title">Your Profile Progress</h4>
              <p className="pb-desc">
                Complete your profile to unlock special benefits and higher visibility.
              </p>
              <div className="pb-bar-wrap">
                <div className="pb-bar"></div>
              </div>
              <p className="pb-lbl">75% Complete - 1 more step</p>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="form-box">
              <h3 className="form-title">Create New Listing</h3>

              {error && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#FAECE5',
                    color: 'var(--coral)',
                    borderRadius: 'var(--r-md)',
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}
                >
                  {error}
                </div>
              )}

              <div className="fg">
                <label className="fl">Item Title *</label>
                <input
                  type="text"
                  name="title"
                  className="fi"
                  placeholder="e.g., Wooden Dining Table"
                  required
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="fg">
                <label className="fl">Category *</label>
                <select
                  name="category"
                  className="fsel"
                  required
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  <option value="furniture">Furniture</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="tools">Tools & Hardware</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="fg">
                <label className="fl">Description *</label>
                <textarea
                  name="description"
                  className="fta"
                  placeholder="Describe the item condition, features, and any defects..."
                  required
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="fg">
                <label className="fl">Price Type</label>
                <div className="price-tog">
                  <button
                    type="button"
                    className={`ptog ${formData.priceType === 'free' ? 'sf' : ''}`}
                    onClick={() =>
                      setFormData({ ...formData, priceType: 'free' })
                    }
                  >
                    🎁 Free
                  </button>
                  <button
                    type="button"
                    className={`ptog ${formData.priceType === 'paid' ? 'sp' : ''}`}
                    onClick={() =>
                      setFormData({ ...formData, priceType: 'paid' })
                    }
                  >
                    💰 Paid
                  </button>
                </div>
              </div>

              {formData.priceType === 'paid' && (
                <div className="fg">
                  <label className="fl">Price (LKR) *</label>
                  <input
                    type="number"
                    name="price"
                    className="fi"
                    placeholder="e.g., 5000"
                    required={formData.priceType === 'paid'}
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="fg">
                <label className="fl">Location *</label>
                <input
                  type="text"
                  name="location"
                  className="fi"
                  placeholder="e.g., Colombo 07"
                  required
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="fg">
                <label className="fl">Upload Photo</label>
                <div
                  className="upload-z"
                  onClick={() => document.getElementById('imageInput').click()}
                >
                  <div className="uz-icon">📸</div>
                  <div className="uz-txt">
                    {formData.image
                      ? formData.image.name
                      : 'Click to upload photo'}
                  </div>
                  <div className="uz-sub">JPG, PNG up to 5MB</div>
                </div>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? '⏳ Posting...' : '✨ Post Item'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostAd;
