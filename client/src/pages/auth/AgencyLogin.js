import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import '../../styles/Auth.css';

const AgencyLogin = ({ setUser }) => {
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
      const response = await apiClient.post('/api/auth/agency/login', formData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ ...user, role: 'agency' }));

      setUser({ ...user, role: 'agency' });
      
      // Check if there's an intended booking to redirect to
      const intendedBooking = sessionStorage.getItem('intendedBooking');
      if (intendedBooking) {
        sessionStorage.removeItem('intendedBooking');
        navigate(`/agency/book/${intendedBooking}`);
      } else {
        navigate('/agency/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <img src="/assets/logo.png" alt="Logo" style={{ width: 70, height: 70, objectFit: 'contain', marginBottom: '1.2rem', borderRadius: '12px' }} />
          <div style={{ fontWeight: 700, fontSize: '2.2rem', margin: 0, color: '#222', marginBottom: '0.2rem', letterSpacing: '0.02em' }}>
            شريم
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.3rem', color: '#222', marginBottom: '0.1rem', letterSpacing: '0.04em' }}>SHURAIM</div>
          <div style={{ fontSize: '0.95rem', color: '#555', marginBottom: '1.2rem', letterSpacing: '0.04em' }}>AIR TRAVEL & TOURS</div>
          <div style={{ background: '#f3f4f6', borderRadius: '20px', padding: '8px 24px', fontWeight: 500, color: '#222', fontSize: '1rem', marginBottom: '0.5rem', boxShadow: 'none', letterSpacing: '0.04em' }}>AGENCY PORTAL</div>
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
              placeholder="agency@example.com"
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
          <p>Forgot your password?</p>
          <div className="auth-link-actions">
            <a href="/agency/forgot-password">Reset Password</a>
            <span className="divider">or</span>
            <a href="/agency/register">Register Agency</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyLogin;
