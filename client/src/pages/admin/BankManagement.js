import React, { useEffect, useState } from 'react';
import apiClient from '../../config/axiosConfig';
import '../../styles/Management.css';

const BankManagement = () => {
  const [banks, setBanks] = useState([]);
  const [form, setForm] = useState({
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    branchName: '',
    branchCode: '',
    branchAddress: '',
    city: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const response = await apiClient.get('/api/banks/admin');
      setBanks(response.data);
      setError('');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error loading banks';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/banks/admin', form);
      setForm({
        bankName: '',
        accountTitle: '',
        accountNumber: '',
        iban: '',
        branchName: '',
        branchCode: '',
        branchAddress: '',
        city: '',
        isActive: true
      });
      await loadBanks();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error creating bank';
      setError(message);
    }
  };

  const toggleBankStatus = async (bank) => {
    try {
      await apiClient.put(`/api/banks/admin/${bank.id}`, { isActive: !bank.isActive });
      await loadBanks();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error updating bank';
      setError(message);
    }
  };

  if (loading) return <div className="loading">Loading banks...</div>;

  return (
    <div className="management-container">
      <h1>Bank Management</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="form-container">
        <h2>Add Bank</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="Bank Name" required />
            <input name="accountTitle" value={form.accountTitle} onChange={handleChange} placeholder="Account Title" required />
          </div>
          <div className="form-row">
            <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Account Number" required />
            <input name="iban" value={form.iban} onChange={handleChange} placeholder="IBAN" />
          </div>
          <div className="form-row">
            <input name="branchName" value={form.branchName} onChange={handleChange} placeholder="Branch Name" />
            <input name="branchCode" value={form.branchCode} onChange={handleChange} placeholder="Branch Code" />
          </div>
          <div className="form-row">
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" />
            <input name="branchAddress" value={form.branchAddress} onChange={handleChange} placeholder="Branch Address" />
          </div>
          <label className="small-note">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
          </label>
          <div style={{ marginTop: '12px' }}>
            <button className="submit-btn" type="submit">Add Bank</button>
          </div>
        </form>
      </div>

      <div className="table-container">
        <h2>All Banks</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Bank</th>
              <th>Account Title</th>
              <th>Account No</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {banks.length === 0 ? (
              <tr>
                <td colSpan="6">No banks added yet.</td>
              </tr>
            ) : (
              banks.map((bank) => (
                <tr key={bank.id}>
                  <td>{bank.bankName}</td>
                  <td>{bank.accountTitle}</td>
                  <td>{bank.accountNumber}</td>
                  <td>{bank.branchName || '-'} {bank.branchCode ? `(${bank.branchCode})` : ''}</td>
                  <td><span className={`status ${bank.isActive ? 'approved' : 'rejected'}`}>{bank.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="actions">
                      <button className="btn-edit" onClick={() => toggleBankStatus(bank)}>
                        {bank.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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

export default BankManagement;
