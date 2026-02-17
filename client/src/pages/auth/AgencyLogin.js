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
      <div className="auth-card admin">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <img src="/assets/logo.png" alt="Logo" style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: '1.2rem', borderRadius: '16px' }} />
          <div className="auth-badge admin">Agency Portal</div>
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
          <p>Are you an admin?</p>
          <div className="auth-link-actions">
            <a href="/admin/login">Admin Login</a>
            <span className="divider">or</span>
            <a href="/agency/register">Register Agency</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyLogin;
