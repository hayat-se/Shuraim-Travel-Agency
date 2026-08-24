import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import AIRLINE_PRESETS, { AIRLINE_REGIONS } from '../../config/airlinePresets';
import { PageHeader, Table, Badge, Button, Modal, ConfirmDialog, FormField, Input, Select, useToast } from '../../components/ui';

export default function AirlineManagement() {
  const toast = useToast();
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', isActive: true });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [presetLogoUrl, setPresetLogoUrl] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAirlines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAirlines = async () => {
    try {
      const res = await apiClient.get('/api/airlines/admin');
      setAirlines(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error loading airlines');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    setPresetLogoUrl(null);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handlePresetSelect = (e) => {
    const preset = AIRLINE_PRESETS.find((a) => a.name === e.target.value);
    if (preset) {
      setForm((prev) => ({ ...prev, name: preset.name, code: preset.code }));
      setPresetLogoUrl(preset.logo);
      setLogoPreview(preset.logo);
      setLogoFile(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', isActive: true });
    setLogoFile(null);
    setPresetLogoUrl(null);
    setLogoPreview(null);
    setShowForm(true);
  };

  const openEdit = (airline) => {
    setEditing(airline);
    setForm({ name: airline.name || '', code: airline.code || '', isActive: airline.isActive });
    setLogoFile(null);
    setPresetLogoUrl(null);
    setLogoPreview(airline.logoUrl ? `${API_BASE_URL}${airline.logoUrl}` : null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('code', form.code);
      payload.append('isActive', form.isActive);
      if (logoFile) {
        payload.append('logo', logoFile);
      } else if (presetLogoUrl) {
        try {
          const blob = await (await fetch(presetLogoUrl)).blob();
          payload.append('logo', blob, `${form.code || 'airline'}_logo.png`);
        } catch { /* preset logo optional */ }
      }
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) {
        await apiClient.put(`/api/airlines/admin/${editing.id}`, payload, cfg);
        toast.success('Airline updated');
      } else {
        await apiClient.post('/api/airlines/admin', payload, cfg);
        toast.success('Airline added');
      }
      setShowForm(false);
      loadAirlines();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving airline');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (airline) => {
    try {
      await apiClient.put(`/api/airlines/admin/${airline.id}`, { isActive: !airline.isActive });
      loadAirlines();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error updating airline');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/airlines/admin/${deleteTarget.id}`);
      toast.success('Airline deleted');
      setDeleteTarget(null);
      loadAirlines();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error deleting airline');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'logo',
      header: 'Logo',
      render: (a) =>
        a.logoUrl ? (
          <img src={`${API_BASE_URL}${a.logoUrl}`} alt={a.name} className="h-8 w-12 rounded-sm object-contain" />
        ) : (
          <span className="flex h-8 w-12 items-center justify-center rounded-sm bg-neutral-100 text-neutral-400"><FiImage size={15} /></span>
        ),
    },
    { key: 'name', header: 'Airline', render: (a) => <span className="font-medium text-neutral-900">{a.name}</span> },
    { key: 'code', header: 'Code', render: (a) => <span className="font-mono">{a.code || '—'}</span> },
    { key: 'status', header: 'Status', render: (a) => <Badge tone={a.isActive ? 'success' : 'neutral'}>{a.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) => (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="outline" icon={<FiEdit2 size={13} />} onClick={() => openEdit(a)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => toggleStatus(a)}>{a.isActive ? 'Deactivate' : 'Activate'}</Button>
          <Button size="sm" variant="danger" icon={<FiTrash2 size={13} />} onClick={() => setDeleteTarget(a)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Airline Management"
        subtitle="Airlines available when creating flights."
        actions={<Button icon={<FiPlus size={15} />} onClick={openCreate}>Add Airline</Button>}
      />
      <Table columns={columns} data={airlines} loading={loading} rowKey="id" emptyTitle="No airlines yet" />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Airline' : 'Add Airline'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="airline-form" loading={saving}>{editing ? 'Update' : 'Add'}</Button>
          </>
        }
      >
        <form id="airline-form" onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <FormField label="Quick pick a preset" htmlFor="preset" hint="Fills name, code and logo — or type manually below.">
              <Select id="preset" value="" onChange={handlePresetSelect}>
                <option value="">Choose an airline…</option>
                {AIRLINE_REGIONS.map((region) => (
                  <optgroup key={region} label={region}>
                    {AIRLINE_PRESETS.filter((a) => a.region === region).map((a) => (
                      <option key={a.code} value={a.name}>{a.name} ({a.code})</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </FormField>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Airline Name" htmlFor="name" required>
              <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Pakistan International Airlines" required />
            </FormField>
            <FormField label="Code" htmlFor="code">
              <Input id="code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. PIA" />
            </FormField>
          </div>
          <FormField label="Logo" htmlFor="logo">
            <input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-sm file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-primary-700 hover:file:bg-primary-100" />
          </FormField>
          {logoPreview && (
            <div className="inline-block rounded-md border border-neutral-200 bg-neutral-50 p-2">
              <img src={logoPreview} alt="Logo preview" className="max-h-14 max-w-[160px] object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded-sm accent-primary" />
            Active
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete airline?"
        message={deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
