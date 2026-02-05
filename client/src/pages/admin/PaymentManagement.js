import React, { useEffect, useState } from 'react';
import apiClient from '../../config/axiosConfig';
import '../../styles/Management.css';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await apiClient.get('/api/payments/admin');
      setPayments(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error loading payments';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (paymentId, status) => {
    try {
      await apiClient.put(`/api/payments/admin/${paymentId}/status`, { status });
      await loadPayments();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error updating payment status';
      setError(message);
    }
  };

  if (loading) return <div className="loading">Loading payments...</div>;

  return (
    <div className="management-container">
      <h1>Payment Approvals</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <h2>Payments</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Agency</th>
              <th>Bank</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="7">No payments submitted yet.</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}</td>
                  <td>{payment.agency?.agencyName || 'Agency'}</td>
                  <td>{payment.bank?.bankName || 'Bank'}</td>
                  <td>{payment.referenceNumber}</td>
                  <td>PKR {Number(payment.amount || 0).toLocaleString()}</td>
                  <td><span className={`status ${payment.status}`}>{payment.status}</span></td>
                  <td>
                    <div className="actions">
                      {payment.status === 'pending' && (
                        <>
                          <button className="btn-approve" onClick={() => updateStatus(payment.id, 'approved')}>Approve</button>
                          <button className="btn-reject" onClick={() => updateStatus(payment.id, 'rejected')}>Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentManagement;
