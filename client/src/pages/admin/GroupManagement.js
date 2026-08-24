import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiImage } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import { PageHeader, Table, Badge, Button, Modal, FormField, Input, useToast } from '../../components/ui';

export default function GroupManagement() {
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', isActive: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGroups = async () => {
    try {
      const res = await apiClient.get('/api/groups/admin');
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error loading groups');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', isActive: true });
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (group) => {
    setEditing(group);
    setForm({ name: group.name, isActive: group.isActive });
    setImageFile(null);
    setImagePreview(group.imageUrl ? `${API_BASE_URL}${group.imageUrl}` : null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('isActive', form.isActive);
      if (imageFile) payload.append('image', imageFile);
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) {
        await apiClient.put(`/api/groups/admin/${editing.id}`, payload, cfg);
        toast.success(`Group "${form.name}" updated`);
      } else {
        await apiClient.post('/api/groups/admin', payload, cfg);
        toast.success(`Group "${form.name}" created`);
      }
      setShowForm(false);
      loadGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving group');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (group) => {
    try {
      await apiClient.put(`/api/groups/admin/${group.id}`, { isActive: !group.isActive });
      toast.success(`Group "${group.name}" ${group.isActive ? 'deactivated' : 'activated'}`);
      loadGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error updating group');
    }
  };

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (g) =>
        g.imageUrl ? (
          <img src={`${API_BASE_URL}${g.imageUrl}`} alt={g.name} className="h-9 w-9 rounded-sm object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-neutral-100 text-neutral-400"><FiImage size={16} /></span>
        ),
    },
    { key: 'name', header: 'Group', render: (g) => <span className="font-medium text-neutral-900">{g.name}</span> },
    { key: 'status', header: 'Status', render: (g) => <Badge tone={g.isActive ? 'success' : 'neutral'}>{g.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (g) => (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="outline" icon={<FiEdit2 size={13} />} onClick={() => openEdit(g)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => toggleStatus(g)}>{g.isActive ? 'Deactivate' : 'Activate'}</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Group Management"
        subtitle="Destination groups shown to agencies."
        actions={<Button icon={<FiPlus size={15} />} onClick={openCreate}>Add Group</Button>}
      />
      <Table columns={columns} data={groups} loading={loading} rowKey="id" emptyTitle="No groups yet" />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Edit Group` : 'Add Group'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="group-form" loading={saving}>{editing ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <form id="group-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Group Name" htmlFor="name" required>
            <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Dubai" required />
          </FormField>
          <FormField label="Image" htmlFor="image" hint="Optional — shown on the agency dashboard.">
            <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-sm file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-primary-700 hover:file:bg-primary-100" />
          </FormField>
          {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 w-28 rounded-md border border-neutral-200 object-cover" />}
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded-sm accent-primary" />
            Active
          </label>
        </form>
      </Modal>
    </div>
  );
}
