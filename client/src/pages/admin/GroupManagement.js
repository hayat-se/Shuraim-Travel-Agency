import React, { useEffect, useState } from 'react';
import apiClient from '../../config/axiosConfig';
import '../../styles/Management.css';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    name: '',
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await apiClient.get('/api/groups/admin');
      setGroups(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error loading groups';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (imageFile) {
        payload.append('image', imageFile);
      }

      await apiClient.post('/api/groups/admin', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setForm({ name: '', isActive: true });
      setImageFile(null);
      await loadGroups();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error creating group';
      setError(message);
    }
  };

  const toggleGroupStatus = async (group) => {
    try {
      await apiClient.put(`/api/groups/admin/${group.id}`, { isActive: !group.isActive });
      await loadGroups();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error updating group';
      setError(message);
    }
  };

  if (loading) return <div className="loading">Loading groups...</div>;

  return (
    <div className="management-container">
      <h1>Group Management</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="form-container">
        <h2>Add Group</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Group Name" required />
          </div>
          <div className="form-row">
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <label className="small-note">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
          </label>
          <div style={{ marginTop: '12px' }}>
            <button className="submit-btn" type="submit">Add Group</button>
          </div>
        </form>
      </div>

      <div className="table-container">
        <h2>All Groups</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Image</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan="4">No groups added yet.</td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>
                    {group.imageUrl ? (
                      <img
                        src={group.imageUrl}
                        alt={group.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td><span className={`status ${group.isActive ? 'approved' : 'rejected'}`}>{group.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="actions">
                      <button className="btn-edit" onClick={() => toggleGroupStatus(group)}>
                        {group.isActive ? 'Deactivate' : 'Activate'}
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

export default GroupManagement;
