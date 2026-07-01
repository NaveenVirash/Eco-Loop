import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API } from '../utils/api';
import './PostAd.css';

const PostAd = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    listingType: 'marketplace',
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
  const [successData, setSuccessData] = useState(null);

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
      data.append('listingType', formData.listingType);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.priceType === 'free' ? 'Free' : formData.price);
      data.append('location', formData.location);
      if (formData.image) {
        data.append('image', formData.image);
      }

      const res = await API.product.create(data);

      if (res.data.pointsEarned !== undefined) {
        if (refreshUser) await refreshUser();
        
        setSuccessData({
          points: res.data.pointsEarned,
          total: res.data.newTotal
        });
      } else {
        alert('Product posted successfully!');
        navigate('/products');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error posting product');
    } finally {
      setLoading(false);
    }
  };

  const currentPoints = user?.points || 0;
  const progressPercent = Math.min((currentPoints / 100) * 100, 100);

  return (
    <>
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
                  <span className="pel-act">📝 Listing type ({formData.listingType === 'marketplace' ? 'Marketplace' : 'Recycling'})</span>
                  <span className="pel-val">{formData.listingType === 'marketplace' ? '05 pts' : '20 pts'}</span>
                </div>
                <div className="pel-row">
                  <span className="pel-act">📸 Upload item photo</span>
                  <span className="pel-val">{formData.image ? '+05 pts' : '00 pts'}</span>
                </div>
                <div className="pel-row" style={{ background: '#E8F5EF', borderColor: '#1E9B6B' }}>
                  <span className="pel-act" style={{ color: '#1E9B6B', fontWeight: 'bold' }}>Total Expected</span>
                  <span className="pel-val" style={{ color: '#1E9B6B' }}>
                    { (formData.listingType === 'marketplace' ? 5 : 20) + (formData.image ? 5 : 0) } pts
                  </span>
                </div>
              </div>

              {user?.role === 'user' && (
                <div className="progress-box">
                  <h4 className="pb-title">Your Top Fan Progress</h4>
                  <p className="pb-desc">
                    Reach 100 points to unlock the Top Fan badge and special benefits!
                  </p>
                  <div className="pb-bar-wrap">
                    <div className="pb-bar" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <p className="pb-lbl">Current: {currentPoints} pts / 100 pts</p>
                </div>
              )}
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
                  <label className="fl">Listing Type</label>
                  <div className="ltype-cards">
                    <div 
                      className={`ltype-card ${formData.listingType === 'marketplace' ? 'selected' : ''}`}
                      onClick={() => setFormData({...formData, listingType: 'marketplace'})}
                    >
                      <div className="ltc-icon">🛒</div>
                      <div className="ltc-info">
                        <h4>Marketplace</h4>
                        <p>For sale, free, or exchange</p>
                      </div>
                    </div>
                    <div 
                      className={`ltype-card ${formData.listingType === 'recycling' ? 'selected' : ''}`}
                      onClick={() => setFormData({...formData, listingType: 'recycling'})}
                    >
                      <div className="ltc-icon">♻️</div>
                      <div className="ltc-info">
                        <h4>Recycling Donation</h4>
                        <p>Send to a recycling partner</p>
                      </div>
                    </div>
                  </div>
                </div>

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

                {formData.listingType === 'marketplace' && (
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
                )}

                {formData.listingType === 'marketplace' && formData.priceType === 'paid' && (
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
                  <label className="fl">Upload Photo {formData.listingType === 'recycling' && '(Earns +5 pts)'}</label>
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

      {successData && (
        <div className="pts-success-overlay">
          <div className="pts-success-modal">
            <div className="pts-icon">🎉</div>
            <h2>Listing Posted!</h2>
            <p>Thank you for contributing to the Eco-Loop community.</p>
            <div className="pts-earned-box">
              <span className="pts-plus">+{successData.points}</span>
              <span className="pts-lbl">Points Earned</span>
            </div>
            <p className="pts-total-lbl">Your new total: <strong>{successData.total} pts</strong></p>
            <button className="btn btn-g btn-lg" style={{width: '100%', marginTop: '20px'}} onClick={() => navigate('/products')}>
              Continue to Products
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostAd;
