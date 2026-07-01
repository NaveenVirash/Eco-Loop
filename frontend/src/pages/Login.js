import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // loading එක true කරන්නේ login process එක පටන් ගන්න කොටයි
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Login to your EcoLoop account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <br />
        <div><p>Don't have an account? </p></div>

        {/* Buttons layout එක මෙතනින් පිරිසිදුව හදලා තියෙනවා */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/register" className="btn-out" style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--g)', border: '1px solid var(--g)' }}>
            Register here
          </Link>

          <Link to="/register-company" className="btn-out" style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--g)', border: '1px solid var(--g)' }}>
            Register Recycling Partner (Company)
          </Link>
        </div>
      </div>
    </div>
  );
}