import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Finance.css';

const Payments = () => {
  const [banks, setBanks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    bankId: '',
    amount: '',
    referenceNumber: '',
    paymentDate: '',
    proofUrl: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [banksRes, paymentsRes] = await Promise.all([
        axios.get('/api/banks', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/payments/my', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBanks(banksRes.data);
      setPayments(paymentsRes.data);
      setError('');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error loading payments';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/payments', {
        ...form,
        amount: Number(form.amount)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setForm({ bankId: '', amount: '', referenceNumber: '', paymentDate: '', proofUrl: '', notes: '' });
      setSuccess('Payment submitted successfully. It will be reviewed by admin.');
      await loadData();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error submitting payment';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatAmount = (value) => Number(value || 0).toLocaleString();

  if (loading) return <div className="loading">Loading payments...</div>;

  return (
    <div className="finance-container">
      <h1>Payments</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="notice">{success}</div>}

      <div className="finance-form">
        <h2>Submit Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <select name="bankId" value={form.bankId} onChange={handleChange} required>
              <option value="">Select Bank</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bankName} - {bank.accountTitle}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="amount"
              placeholder="Amount (PKR)"
              value={form.amount}
              onChange={handleChange}
              required
              min="1"
            />
            <input
              type="text"
              name="referenceNumber"
              placeholder="Reference / Transaction ID"
              value={form.referenceNumber}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="paymentDate"
              value={form.paymentDate}
              onChange={handleChange}
            />
            <input
              type="text"
              name="proofUrl"
              placeholder="Proof URL (optional)"
              value={form.proofUrl}
              onChange={handleChange}
            />
          </div>
          <textarea
            name="notes"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={handleChange}
            rows="3"
          />
          <div style={{ marginTop: '12px' }}>
            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <h2>My Payments</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bank</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="5">No payments submitted yet.</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}</td>
                  <td>{payment.bank?.bankName || 'Bank'}</td>
                  <td>{payment.referenceNumber}</td>
                  <td>PKR {formatAmount(payment.amount)}</td>
                  <td><span className={`badge ${payment.status}`}>{payment.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
