import React, { useEffect, useState } from 'react';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
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
  const [imageFile, setImageFile] = useState(null);
  const [editingBank, setEditingBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const response = await apiClient.get('/api/banks/admin');
      setBanks(Array.isArray(response.data) ? response.data : []);
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const startEdit = (bank) => {
    setEditingBank(bank);
    setForm({
      bankName: bank.bankName || '',
      accountTitle: bank.accountTitle || '',
      accountNumber: bank.accountNumber || '',
      iban: bank.iban || '',
      branchName: bank.branchName || '',
      branchCode: bank.branchCode || '',
      branchAddress: bank.branchAddress || '',
      city: bank.city || '',
      isActive: bank.isActive
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingBank(null);
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
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingBank) {
        await apiClient.put(`/api/banks/admin/${editingBank.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await apiClient.post('/api/banks/admin', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setEditingBank(null);
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
      setImageFile(null);
      await loadBanks();
    } catch (err) {
      const message = err.response?.data?.error || err.message || (editingBank ? 'Error updating bank' : 'Error creating bank');
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

  const deleteBank = async (bank) => {
    if (!window.confirm(`Are you sure you want to delete "${bank.bankName}"? This action cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/banks/admin/${bank.id}`);
      if (editingBank && editingBank.id === bank.id) {
        cancelEdit();
      }
      await loadBanks();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error deleting bank';
      setError(message);
    }
  };

  if (loading) return <div className="loading">Loading banks...</div>;

  return (
    <div className="management-container">
      <h1>Bank Management</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="form-container">
        <h2>{editingBank ? 'Edit Bank' : 'Add Bank'}</h2>
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
          <div className="form-row">
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <label className="small-note">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
          </label>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
            <button className="submit-btn" type="submit">{editingBank ? 'Update Bank' : 'Add Bank'}</button>
            {editingBank && (
              <button className="btn-edit" type="button" onClick={cancelEdit}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="table-container">
        <h2>All Banks</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Bank</th>
              <th>Image</th>
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
                <td colSpan="7">No banks added yet.</td>
              </tr>
            ) : (
              banks.map((bank) => (
                <tr key={bank.id}>
                  <td>{bank.bankName}</td>
                  <td>
                    {bank.imageUrl ? (
                      <img
                        src={`${API_BASE_URL}${bank.imageUrl}`}
                        alt={bank.bankName}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{bank.accountTitle}</td>
                  <td>{bank.accountNumber}</td>
                  <td>{bank.branchName || '-'} {bank.branchCode ? `(${bank.branchCode})` : ''}</td>
                  <td><span className={`status ${bank.isActive ? 'approved' : 'rejected'}`}>{bank.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="actions">
                      <button className="btn-edit" onClick={() => startEdit(bank)}>Edit</button>
                      <button className="btn-edit" onClick={() => toggleBankStatus(bank)}>
                        {bank.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn-delete" onClick={() => deleteBank(bank)}>Delete</button>
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
