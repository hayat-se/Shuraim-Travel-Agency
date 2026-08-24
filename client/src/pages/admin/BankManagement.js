import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import { PageHeader, Table, Badge, Button, Modal, ConfirmDialog, FormField, Input, useToast } from '../../components/ui';

const EMPTY = {
  bankName: '', accountTitle: '', accountNumber: '', iban: '',
  branchName: '', branchCode: '', branchAddress: '', city: '', isActive: true,
};

export default function BankManagement() {
  const toast = useToast();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadBanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBanks = async () => {
    try {
      const res = await apiClient.get('/api/banks/admin');
      setBanks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error loading banks');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const openCreate = () => { setEditing(null); setForm(EMPTY); setImageFile(null); setShowForm(true); };
  const openEdit = (bank) => {
    setEditing(bank);
    setForm({
      bankName: bank.bankName || '', accountTitle: bank.accountTitle || '', accountNumber: bank.accountNumber || '',
      iban: bank.iban || '', branchName: bank.branchName || '', branchCode: bank.branchCode || '',
      branchAddress: bank.branchAddress || '', city: bank.city || '', isActive: bank.isActive,
    });
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      if (imageFile) payload.append('image', imageFile);
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editing) {
        await apiClient.put(`/api/banks/admin/${editing.id}`, payload, cfg);
        toast.success('Bank updated');
      } else {
        await apiClient.post('/api/banks/admin', payload, cfg);
        toast.success('Bank added');
      }
      setShowForm(false);
      loadBanks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving bank');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (bank) => {
    try {
      await apiClient.put(`/api/banks/admin/${bank.id}`, { isActive: !bank.isActive });
      loadBanks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error updating bank');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/banks/admin/${deleteTarget.id}`);
      toast.success('Bank deleted');
      setDeleteTarget(null);
      loadBanks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error deleting bank');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'image',
      header: 'Logo',
      render: (b) =>
        b.imageUrl ? (
          <img src={`${API_BASE_URL}${b.imageUrl}`} alt={b.bankName} className="h-9 w-9 rounded-sm object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-neutral-100 text-neutral-400"><FiImage size={15} /></span>
        ),
    },
    { key: 'bankName', header: 'Bank', render: (b) => <span className="font-medium text-neutral-900">{b.bankName}</span> },
    { key: 'accountTitle', header: 'Account Title' },
    { key: 'accountNumber', header: 'Account No', render: (b) => <span className="font-mono">{b.accountNumber}</span> },
    { key: 'branch', header: 'Branch', render: (b) => `${b.branchName || '—'}${b.branchCode ? ` (${b.branchCode})` : ''}` },
    { key: 'status', header: 'Status', render: (b) => <Badge tone={b.isActive ? 'success' : 'neutral'}>{b.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) => (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="outline" icon={<FiEdit2 size={13} />} onClick={() => openEdit(b)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => toggleStatus(b)}>{b.isActive ? 'Deactivate' : 'Activate'}</Button>
          <Button size="sm" variant="danger" icon={<FiTrash2 size={13} />} onClick={() => setDeleteTarget(b)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Bank Management"
        subtitle="Bank accounts agencies pay into."
        actions={<Button icon={<FiPlus size={15} />} onClick={openCreate}>Add Bank</Button>}
      />
      <Table columns={columns} data={banks} loading={loading} rowKey="id" emptyTitle="No banks yet" />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Bank' : 'Add Bank'}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="bank-form" loading={saving}>{editing ? 'Update' : 'Add'}</Button>
          </>
        }
      >
        <form id="bank-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Bank Name" htmlFor="bankName" required>
            <Input id="bankName" value={form.bankName} onChange={set('bankName')} required />
          </FormField>
          <FormField label="Account Title" htmlFor="accountTitle" required>
            <Input id="accountTitle" value={form.accountTitle} onChange={set('accountTitle')} required />
          </FormField>
          <FormField label="Account Number" htmlFor="accountNumber" required>
            <Input id="accountNumber" value={form.accountNumber} onChange={set('accountNumber')} required />
          </FormField>
          <FormField label="IBAN" htmlFor="iban">
            <Input id="iban" value={form.iban} onChange={set('iban')} />
          </FormField>
          <FormField label="Branch Name" htmlFor="branchName">
            <Input id="branchName" value={form.branchName} onChange={set('branchName')} />
          </FormField>
          <FormField label="Branch Code" htmlFor="branchCode">
            <Input id="branchCode" value={form.branchCode} onChange={set('branchCode')} />
          </FormField>
          <FormField label="City" htmlFor="city">
            <Input id="city" value={form.city} onChange={set('city')} />
          </FormField>
          <FormField label="Branch Address" htmlFor="branchAddress">
            <Input id="branchAddress" value={form.branchAddress} onChange={set('branchAddress')} />
          </FormField>
          <FormField label="Logo / Image" htmlFor="image" className="sm:col-span-2">
            <input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-sm file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-primary-700 hover:file:bg-primary-100" />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-neutral-700 sm:col-span-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded-sm accent-primary" />
            Active
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete bank?"
        message={deleteTarget ? `Delete "${deleteTarget.bankName}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
