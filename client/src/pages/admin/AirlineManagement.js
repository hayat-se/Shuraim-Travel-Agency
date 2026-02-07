import React, { useEffect, useState } from 'react';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import '../../styles/Management.css';

const AirlineManagement = () => {
  const [airlines, setAirlines] = useState([]);
  const [form, setForm] = useState({ name: '', code: '', isActive: true });
  const [logoFile, setLogoFile] = useState(null);
  const [editingAirline, setEditingAirline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAirlines();
  }, []);

  const loadAirlines = async () => {
    try {
      const response = await apiClient.get('/api/airlines/admin');
      setAirlines(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error loading airlines');
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

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files?.[0] || null);
  };

  const startEdit = (airline) => {
    setEditingAirline(airline);
    setForm({
      name: airline.name || '',
      code: airline.code || '',
      isActive: airline.isActive
    });
    setLogoFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingAirline(null);
    setForm({ name: '', code: '', isActive: true });
    setLogoFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('code', form.code);
      payload.append('isActive', form.isActive);
      if (logoFile) {
        payload.append('logo', logoFile);
      }

      if (editingAirline) {
        await apiClient.put(`/api/airlines/admin/${editingAirline.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Airline updated successfully!');
      } else {
        await apiClient.post('/api/airlines/admin', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Airline added successfully!');
      }

      setEditingAirline(null);
      setForm({ name: '', code: '', isActive: true });
      setLogoFile(null);
      setError('');
      await loadAirlines();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error saving airline');
      setSuccess('');
    }
  };

  const toggleStatus = async (airline) => {
    try {
      await apiClient.put(`/api/airlines/admin/${airline.id}`, { isActive: !airline.isActive });
      await loadAirlines();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error updating airline');
    }
  };

  const deleteAirline = async (airline) => {
    if (!window.confirm(`Are you sure you want to delete "${airline.name}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/airlines/admin/${airline.id}`);
      if (editingAirline && editingAirline.id === airline.id) {
        cancelEdit();
      }
      await loadAirlines();
      setSuccess('Airline deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error deleting airline');
    }
  };

  if (loading) return <div className="loading">Loading airlines...</div>;

  return (
    <div className="management-container">
      <h1>Airline Management</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="form-container">
        <h2>{editingAirline ? 'Edit Airline' : 'Add Airline'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Airline Name (e.g., Pakistan International Airlines)"
              required
            />
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="Airline Code (e.g., PIA)"
            />
          </div>
          <div className="form-row">
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#64748b' }}>
                Airline Logo
              </label>
              <input type="file" accept="image/*" onChange={handleLogoChange} />
              {editingAirline && editingAirline.logoUrl && !logoFile && (
                <div style={{ marginTop: '8px' }}>
                  <img
                    src={`${API_BASE_URL}${editingAirline.logoUrl}`}
                    alt="Current logo"
                    style={{ width: '60px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  />
                  <span style={{ marginLeft: '8px', fontSize: '12px', color: '#64748b' }}>Current logo</span>
                </div>
              )}
            </div>
          </div>
          <label className="small-note">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
          </label>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
            <button className="submit-btn" type="submit">
              {editingAirline ? 'Update Airline' : 'Add Airline'}
            </button>
            {editingAirline && (
              <button className="btn-edit" type="button" onClick={cancelEdit}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="table-container">
        <h2>All Airlines</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Airline Name</th>
              <th>Code</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {airlines.length === 0 ? (
              <tr>
                <td colSpan="5">No airlines added yet.</td>
              </tr>
            ) : (
              airlines.map((airline) => (
                <tr key={airline.id}>
                  <td>
                    {airline.logoUrl ? (
                      <img
                        src={`${API_BASE_URL}${airline.logoUrl}`}
                        alt={airline.name}
                        style={{ width: '50px', height: '35px', objectFit: 'contain', borderRadius: '4px' }}
                      />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>No logo</span>
                    )}
                  </td>
                  <td>{airline.name}</td>
                  <td>{airline.code || '-'}</td>
                  <td>
                    <span className={`status ${airline.isActive ? 'approved' : 'rejected'}`}>
                      {airline.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn-edit" onClick={() => startEdit(airline)}>Edit</button>
                      <button className="btn-edit" onClick={() => toggleStatus(airline)}>
                        {airline.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn-delete" onClick={() => deleteAirline(airline)}>Delete</button>
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

export default AirlineManagement;
