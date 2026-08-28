import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import AuthLayout from '../../components/AuthLayout';
import { Button, FormField, Input } from '../../components/ui';

const AgencyLogin = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
    <AuthLayout
      badge="Agency Portal"
      title="Sign in to your account"
      subtitle="Search flights, book seats and manage your ledger."
      footer={
        <>
          <Link to="/agency/forgot-password" className="font-medium text-primary hover:underline">Forgot password?</Link>
          <br />
          <span className="text-neutral-400">New here? </span>
          <Link to="/agency/register" className="font-medium text-primary hover:underline">Register your agency</Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-sm border-l-4 border-danger bg-red-50 px-3 py-2 text-sm text-danger">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email" htmlFor="email">
          <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="agency@example.com" />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" />
        </FormField>
        <Button type="submit" size="lg" loading={loading} className="w-full">Login</Button>
      </form>
    </AuthLayout>
  );
};

export default AgencyLogin;
