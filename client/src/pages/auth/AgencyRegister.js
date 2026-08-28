import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { Card, CardBody, Button, FormField, Input, Textarea, useToast } from '../../components/ui';

const EMPTY = {
  agencyName: '', email: '', password: '', confirmPassword: '', contactPerson: '',
  phone: '', phone2: '', address: '', city: '',
};

export default function AgencyRegister() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setFormData((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      await apiClient.post('/api/auth/agency/register', submitData);
      toast.success('Registration submitted — pending admin approval.');
      setTimeout(() => navigate('/agency/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8CC6F5] via-[#DCEDFB] to-white px-4 py-10">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/assets/shuraim-favicon.png" alt="Shuraim Air" className="h-10 w-10 object-contain" />
          <div className="leading-tight">
            <p className="text-sm font-bold text-ink">Shuraim Air</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Travel &amp; Tours</p>
          </div>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 rounded-sm border border-neutral-300 bg-white/80 px-3 py-1.5 text-sm font-medium text-neutral-700 backdrop-blur transition-colors hover:bg-white">
          <FiHome size={14} /> Home
        </Link>
      </div>

      <Card className="mx-auto mt-6 max-w-2xl">
        <CardBody className="p-6 sm:p-8">
          <h1 className="text-xl font-semibold text-ink">Register your agency</h1>
          <p className="mt-1 text-sm text-neutral-500">Request an account — you’ll be notified once an admin approves it.</p>

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Agency Name" htmlFor="agencyName" required>
              <Input id="agencyName" value={formData.agencyName} onChange={set('agencyName')} required />
            </FormField>
            <FormField label="Contact Person" htmlFor="contactPerson" required>
              <Input id="contactPerson" value={formData.contactPerson} onChange={set('contactPerson')} required />
            </FormField>
            <FormField label="Email" htmlFor="email" required>
              <Input id="email" type="email" value={formData.email} onChange={set('email')} required />
            </FormField>
            <FormField label="City" htmlFor="city">
              <Input id="city" value={formData.city} onChange={set('city')} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" required>
              <Input id="phone" type="tel" value={formData.phone} onChange={set('phone')} required />
            </FormField>
            <FormField label="Phone 2 (optional)" htmlFor="phone2">
              <Input id="phone2" type="tel" value={formData.phone2} onChange={set('phone2')} />
            </FormField>
            <FormField label="Password" htmlFor="password" required>
              <Input id="password" type="password" value={formData.password} onChange={set('password')} required />
            </FormField>
            <FormField label="Confirm Password" htmlFor="confirmPassword" required>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={set('confirmPassword')} required />
            </FormField>
            <FormField label="Address" htmlFor="address" className="sm:col-span-2">
              <Textarea id="address" rows={2} value={formData.address} onChange={set('address')} />
            </FormField>

            <div className="sm:col-span-2">
              <Button type="submit" size="lg" className="w-full" loading={loading}>Submit Registration Request</Button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/agency/login" className="font-medium text-primary hover:underline">Login here</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
