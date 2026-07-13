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

    // Front-end validation
    if (!formData.category) {
      setError('Please select a category.');
      setLoading(false);
      return;
    }
    if (!formData.location) {
      setError('Please select a district / location.');
      setLoading(false);
      return;
    }
    if (formData.listingType === 'marketplace' && formData.priceType === 'paid' && !formData.price) {
      setError('Please enter a price for paid listings.');
      setLoading(false);
      return;
    }

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

      // Recycling posts award 5 pts immediately
      if (res.data.pointsEarned > 0) {
        if (refreshUser) await refreshUser();
        setSuccessData({
          points: res.data.pointsEarned,
          total: res.data.newTotal,
          isRecycling: formData.listingType === 'recycling'
        });
      } else {
        // Marketplace posts — no instant points; they come via dual-confirm
        setSuccessData({
          points: 0,
          total: user?.points || 0,
          isMarketplace: true
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error posting product. Please try again.');
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
                {formData.listingType === 'recycling' ? (
                  <>
                    <div className="pel-row">
                      <span className="pel-act">♻️ Contact Recycling Center</span>
                      <span className="pel-val">+05 pts (instant)</span>
                    </div>
                    <div className="pel-row" style={{ background: '#E8F5EF', borderColor: '#1E9B6B' }}>
                      <span className="pel-act" style={{ color: '#1E9B6B', fontWeight: 'bold' }}>Total on Post</span>
                      <span className="pel-val" style={{ color: '#1E9B6B' }}>05 pts</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pel-row">
                      <span className="pel-act">🛒 Marketplace Listing</span>
                      <span className="pel-val">posted</span>
                    </div>
                    <div className="pel-row">
                      <span className="pel-act">🤝 After confirmed pickup</span>
                      <span className="pel-val">+10 pts</span>
                    </div>
                    <div className="pel-row" style={{ background: '#E8F5EF', borderColor: '#1E9B6B' }}>
                      <span className="pel-act" style={{ color: '#1E9B6B', fontWeight: 'bold' }}>Total on Completion</span>
                      <span className="pel-val" style={{ color: '#1E9B6B' }}>10 pts</span>
                    </div>
                  </>
                )}
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
                        <h4>Contact Recycling Center</h4>
                        <p>Sent directly to recycling partners (+5 pts)</p>
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
                  <label className="fl">District / Location *</label>
                  <select
                    name="location"
                    className="fsel"
                    required
                    value={formData.location}
                    onChange={handleChange}
                  >
                    <option value="">Select a district</option>
                    <option value="Ampara">Ampara</option>
                    <option value="Anuradhapura">Anuradhapura</option>
                    <option value="Badulla">Badulla</option>
                    <option value="Batticaloa">Batticaloa</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Galle">Galle</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Hambantota">Hambantota</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Kalutara">Kalutara</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Kegalle">Kegalle</option>
                    <option value="Kilinochchi">Kilinochchi</option>
                    <option value="Kurunegala">Kurunegala</option>
                    <option value="Mannar">Mannar</option>
                    <option value="Matale">Matale</option>
                    <option value="Matara">Matara</option>
                    <option value="Monaragala">Monaragala</option>
                    <option value="Mullaitivu">Mullaitivu</option>
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                    <option value="Polonnaruwa">Polonnaruwa</option>
                    <option value="Puttalam">Puttalam</option>
                    <option value="Ratnapura">Ratnapura</option>
                    <option value="Trincomalee">Trincomalee</option>
                    <option value="Vavuniya">Vavuniya</option>
                  </select>
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
            {successData.isRecycling ? (
              <>
                <p>Your item has been sent directly to recycling centers.</p>
                <div className="pts-earned-box">
                  <span className="pts-plus">+{successData.points}</span>
                  <span className="pts-lbl">Points Earned</span>
                </div>
                <p className="pts-total-lbl">Your new total: <strong>{successData.total} pts</strong></p>
              </>
            ) : (
              <>
                <p>Your item is now live in the marketplace. You'll earn <strong>10 Eco-Points</strong> when a collector picks it up and both of you confirm.</p>
              </>
            )}
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
