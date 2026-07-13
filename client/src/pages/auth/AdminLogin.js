import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import AuthLayout from '../../components/AuthLayout';
import { Button, FormField, Input } from '../../components/ui';

const AdminLogin = ({ setUser }) => {
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
    <AuthLayout
      badge="Admin Portal"
      title="Welcome back"
      subtitle="Sign in to manage flights, agencies and bookings."
      footer={
        <>
          Are you an agency?{' '}
          <Link to="/agency/login" className="font-medium text-primary hover:underline">Agency Login</Link>
          {' · '}
          <Link to="/agency/register" className="font-medium text-primary hover:underline">Register</Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-sm border-l-4 border-danger bg-red-50 px-3 py-2 text-sm text-danger">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email" htmlFor="email">
          <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="admin@example.com" />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" />
        </FormField>
        <Button type="submit" size="lg" loading={loading} className="w-full">Login</Button>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;
