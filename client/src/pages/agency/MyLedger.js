import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Finance.css';

const MyLedger = () => {
  const [summary, setSummary] = useState({ totalDebit: 0, totalCredit: 0, balance: 0 });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/ledger/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(response.data.summary);
      setEntries(response.data.entries);
      setError('');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error loading ledger';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value) => Number(value || 0).toLocaleString();

  if (loading) return <div className="loading">Loading ledger...</div>;

  return (
    <div className="finance-container">
      <h1>My Ledger</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="card-grid">
        <div className="summary-card">
          <h3>Total Charges</h3>
          <div className="amount">PKR {formatAmount(summary.totalDebit)}</div>
        </div>
        <div className="summary-card">
          <h3>Total Payments</h3>
          <div className="amount">PKR {formatAmount(summary.totalCredit)}</div>
        </div>
        <div className="summary-card">
          <h3>Current Balance</h3>
          <div className="amount">PKR {formatAmount(summary.balance)}</div>
        </div>
      </div>

      <div className="table-card">
        <h2>Ledger Entries</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Running Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan="7">No ledger entries yet.</td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.date).toLocaleString()}</td>
                  <td><span className={`badge ${entry.type}`}>{entry.type}</span></td>
                  <td>{entry.description}</td>
                  <td>{entry.reference}</td>
                  <td>PKR {formatAmount(entry.amount)}</td>
                  <td><span className={`badge ${entry.status}`}>{entry.status}</span></td>
                  <td>PKR {formatAmount(entry.runningBalance)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyLedger;
