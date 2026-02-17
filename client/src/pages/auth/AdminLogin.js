import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import '../../styles/Auth.css';

const AdminLogin = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/auth/admin/login', formData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ ...user, role: 'admin' }));

      setUser({ ...user, role: 'admin' });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative' }}>
      {/* Animated Home Button */}
      <Link
        to="/"
        className="home-btn-animated"
        style={{
          position: 'absolute',
          top: 32,
          right: 40,
          zIndex: 10,
          textDecoration: 'none',
          background: 'linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)',
          color: '#fff',
          padding: '12px 28px',
          borderRadius: '18px',
          fontWeight: 700,
          fontSize: '1.1rem',
          boxShadow: '0 4px 16px 0 rgba(0,114,255,0.12)',
          letterSpacing: '0.04em',
          transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s',
          animation: 'homeBtnPulse 1.6s infinite',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 6px 24px 0 rgba(0,114,255,0.18)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(0,114,255,0.12)';
        }}
      >
        🏠 Home
      </Link>
      {/* End Home Button */}
      <div className="auth-card admin">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <img src="/assets/logo.png" alt="Logo" style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: '1.2rem', borderRadius: '16px' }} />
          <div className="auth-badge admin">Admin Portal</div>
          {/* Removed Admin Login and subtitle for cleaner header */}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-links">
          <p>Are you an agency?</p>
          <div className="auth-link-actions">
            <Link to="/agency/login">Agency Login</Link>
            <span className="divider">or</span>
            <Link to="/agency/register">Register Agency</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
