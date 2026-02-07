import React, { useEffect, useState } from 'react';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import '../../styles/Management.css';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    name: '',
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setForm({ name: '', isActive: true });
    setImageFile(null);
    setImagePreview(null);
    setEditingGroup(null);
    setError('');
  };

  const handleEditClick = (group) => {
    setEditingGroup(group);
    setForm({
      name: group.name,
      isActive: group.isActive
    });
    setImageFile(null);
    setImagePreview(group.imageUrl ? `${API_BASE_URL}${group.imageUrl}` : null);
    setError('');
    setSuccess('');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('isActive', form.isActive);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingGroup) {
        await apiClient.put(`/api/groups/admin/${editingGroup.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess(`Group "${form.name}" updated successfully!`);
      } else {
        await apiClient.post('/api/groups/admin', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess(`Group "${form.name}" created successfully!`);
      }

      resetForm();
      await loadGroups();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error saving group';
      setError(message);
    }
  };

  const toggleGroupStatus = async (group) => {
    try {
      await apiClient.put(`/api/groups/admin/${group.id}`, { isActive: !group.isActive });
      setSuccess(`Group "${group.name}" ${group.isActive ? 'deactivated' : 'activated'} successfully!`);
      await loadGroups();
      setTimeout(() => setSuccess(''), 3000);
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
      {success && <div className="success-message">{success}</div>}

      <div className="form-container">
        <h2>{editingGroup ? `Edit Group: ${editingGroup.name}` : 'Add Group'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Group Name" required />
          </div>
          <div className="form-row">
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          {imagePreview && (
            <div style={{ marginBottom: '12px' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }}
              />
            </div>
          )}
          <label className="small-note">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} /> Active
          </label>
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
            <button className="submit-btn" type="submit">
              <i className={`fa-solid ${editingGroup ? 'fa-save' : 'fa-plus'}`}></i>
              {editingGroup ? ' Update Group' : ' Add Group'}
            </button>
            {editingGroup && (
              <button type="button" className="btn-cancel" onClick={resetForm} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                ✖ Cancel
              </button>
            )}
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
              <th>Actions</th>
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
                        src={`${API_BASE_URL}${group.imageUrl}`}
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
                      <button className="btn-edit" onClick={() => handleEditClick(group)}>
                        ✎ Edit
                      </button>
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
