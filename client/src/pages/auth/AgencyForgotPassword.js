import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import '../../styles/Auth.css';

const AgencyForgotPassword = () => {
  const [step, setStep] = useState('request');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/api/auth/agency/password/otp', { email: formData.email });
      setSuccess('If the email exists, an OTP has been sent. Check your inbox.');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/api/auth/agency/password/reset', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setSuccess('Password reset successful. You can now log in.');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-badge">Agency Portal</div>
        <h1>Forgot Password</h1>
        <p className="subtitle">Reset your password using a one-time code</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === 'request' && (
          <form onSubmit={handleRequestOtp}>
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

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
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
              <label>OTP Code</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
                placeholder="Enter 6-digit OTP"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="Enter new password"
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
                placeholder="Confirm new password"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-links">
          <p>Remembered your password?</p>
          <div className="auth-link-actions">
            <Link to="/agency/login">Back to Login</Link>
            <span className="divider">or</span>
            <Link to="/agency/register">Register Agency</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyForgotPassword;
