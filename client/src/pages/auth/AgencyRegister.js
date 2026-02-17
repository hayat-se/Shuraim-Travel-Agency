import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import '../../styles/Auth.css';

const AgencyRegister = () => {
  const [formData, setFormData] = useState({
    agencyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactPerson: '',
    phone: '',
    phone2: '',
    address: '',
    city: '',
    registrationNumber: '',
    taxId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      await apiClient.post('/api/auth/agency/register', submitData);

      setSuccess('Registration successful! Your request is pending admin approval. You will be notified via email.');
      setTimeout(() => navigate('/agency/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
        <svg width="20" height="20" viewBox="0 0 27 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
        Home
      </Link>
      {/* End Home Button */}
      <div className="auth-card wide">
        <h1>Agency Registration</h1>
        <p className="subtitle">Request an account to access the Airline Agency Management System</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Agency Name</label>
              <input
                type="text"
                name="agencyName"
                value={formData.agencyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone 2 (Optional)</label>
              <input
                type="tel"
                name="phone2"
                value={formData.phone2}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Tax ID</label>
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group full">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
            ></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Submit Registration Request'}
          </button>
        </form>

        <div className="auth-links">
          <p>Already have an account? <a href="/agency/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default AgencyRegister;
