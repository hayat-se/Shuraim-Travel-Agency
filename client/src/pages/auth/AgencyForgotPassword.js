import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import AuthLayout from '../../components/AuthLayout';
import { Button, FormField, Input, useToast } from '../../components/ui';

export default function AgencyForgotPassword() {
  const toast = useToast();
  const [step, setStep] = useState('request');
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setFormData((p) => ({ ...p, [k]: e.target.value }));

  const requestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/api/auth/agency/password/otp', { email: formData.email });
      toast.success('If the email exists, an OTP has been sent. Check your inbox.');
      setStep('reset');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/api/auth/agency/password/reset', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      toast.success('Password reset successful. You can now log in.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Agency Portal"
      title="Forgot password"
      subtitle="Reset your password using a one-time code."
      footer={
        <>
          <Link to="/agency/login" className="font-medium text-primary hover:underline">Back to login</Link>
          {' · '}
          <Link to="/agency/register" className="font-medium text-primary hover:underline">Register</Link>
        </>
      }
    >
      {step === 'request' ? (
        <form onSubmit={requestOtp} className="space-y-4">
          <FormField label="Email" htmlFor="email">
            <Input id="email" type="email" value={formData.email} onChange={set('email')} required placeholder="agency@example.com" />
          </FormField>
          <Button type="submit" size="lg" className="w-full" loading={loading}>Send OTP</Button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="space-y-4">
          <FormField label="Email" htmlFor="email">
            <Input id="email" type="email" value={formData.email} onChange={set('email')} required placeholder="agency@example.com" />
          </FormField>
          <FormField label="OTP Code" htmlFor="otp">
            <Input id="otp" value={formData.otp} onChange={set('otp')} required placeholder="6-digit code" />
          </FormField>
          <FormField label="New Password" htmlFor="newPassword">
            <Input id="newPassword" type="password" value={formData.newPassword} onChange={set('newPassword')} required />
          </FormField>
          <FormField label="Confirm Password" htmlFor="confirmPassword">
            <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={set('confirmPassword')} required />
          </FormField>
          <Button type="submit" size="lg" className="w-full" loading={loading}>Reset Password</Button>
        </form>
      )}
    </AuthLayout>
  );
}
