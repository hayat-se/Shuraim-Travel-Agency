import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiSlash, FiUnlock } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { PageHeader, Table, Badge, Button, Tabs, Input, Select, ConfirmDialog, useToast } from '../../components/ui';

export default function AgencyManagement() {
  const toast = useToast();
  const [agencies, setAgencies] = useState([]);
  const [pendingAgencies, setPendingAgencies] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionId, setActionId] = useState(null);
  const [dialog, setDialog] = useState(null); // { type, agency }
  const [working, setWorking] = useState(false);

  useEffect(() => {
    fetchAgencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAgencies = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        apiClient.get('/api/admin/agencies/pending'),
        apiClient.get('/api/admin/agencies'),
      ]);
      setPendingAgencies(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      setAgencies(Array.isArray(allRes.data) ? allRes.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error fetching agencies');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (agency) => {
    setActionId(agency.id);
    try {
      await apiClient.put(`/api/admin/agencies/${agency.id}/approve`, {});
      toast.success(`${agency.agencyName} approved`);
      fetchAgencies();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error approving agency');
    } finally {
      setActionId(null);
    }
  };

  // reject (with reason) / block / unblock all funnel through the dialog
  const runDialog = async (reason) => {
    if (!dialog) return;
    const { type, agency } = dialog;
    setWorking(true);
    try {
      if (type === 'reject') {
        await apiClient.put(`/api/admin/agencies/${agency.id}/reject`, { reason });
        toast.success(`${agency.agencyName} rejected`);
      } else if (type === 'block') {
        await apiClient.put(`/api/admin/agencies/${agency.id}/block`, {});
        toast.success(`${agency.agencyName} blocked`);
      } else if (type === 'unblock') {
        await apiClient.put(`/api/admin/agencies/${agency.id}/unblock`, {});
        toast.success(`${agency.agencyName} unblocked`);
      }
      setDialog(null);
      fetchAgencies();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setWorking(false);
    }
  };

  const matchesSearch = (a) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [a.agencyName, a.contactPerson, a.email, a.city].some((v) => v?.toLowerCase().includes(term));
  };

  const filteredPending = pendingAgencies.filter(matchesSearch);
  const filteredAll = agencies.filter((a) => (statusFilter === 'all' || a.status === statusFilter) && matchesSearch(a));

  const pendingColumns = [
    { key: 'agencyName', header: 'Agency', render: (a) => <span className="font-medium text-neutral-900">{a.agencyName}</span> },
    { key: 'contactPerson', header: 'Contact' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'city', header: 'City' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) => (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="success" icon={<FiCheck size={13} />} loading={actionId === a.id} onClick={() => approve(a)}>Approve</Button>
          <Button size="sm" variant="danger" icon={<FiX size={13} />} disabled={actionId === a.id} onClick={() => setDialog({ type: 'reject', agency: a })}>Reject</Button>
        </div>
      ),
    },
  ];

  const allColumns = [
    { key: 'agencyName', header: 'Agency', render: (a) => <span className="font-medium text-neutral-900">{a.agencyName}</span> },
    { key: 'contactPerson', header: 'Contact' },
    { key: 'email', header: 'Email' },
    { key: 'city', header: 'City' },
    { key: 'status', header: 'Status', render: (a) => <Badge status={a.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (a) => (
        <div className="flex justify-end gap-1.5">
          {a.status === 'approved' && (
            <Button size="sm" variant="danger" icon={<FiSlash size={13} />} disabled={actionId === a.id} onClick={() => setDialog({ type: 'block', agency: a })}>Block</Button>
          )}
          {a.status === 'blocked' && (
            <Button size="sm" variant="success" icon={<FiUnlock size={13} />} disabled={actionId === a.id} onClick={() => setDialog({ type: 'unblock', agency: a })}>Unblock</Button>
          )}
        </div>
      ),
    },
  ];

  const dialogCopy = {
    reject: { title: 'Reject agency?', message: 'Provide a reason — the agency will be notified.', confirmLabel: 'Reject', variant: 'danger', withReason: true, reasonRequired: true },
    block: { title: 'Block agency?', message: 'The agency will lose access until unblocked.', confirmLabel: 'Block', variant: 'danger' },
    unblock: { title: 'Unblock agency?', message: 'The agency will regain access.', confirmLabel: 'Unblock', variant: 'primary' },
  };
  const dc = dialog ? dialogCopy[dialog.type] : {};

  return (
    <div>
      <PageHeader title="Agency Management" subtitle="Approve, reject and manage partner agencies." />

      <Tabs
        className="mb-4"
        value={activeTab}
        onChange={setActiveTab}
        tabs={[
          { value: 'pending', label: 'Pending', count: pendingAgencies.length },
          { value: 'all', label: 'All Agencies', count: agencies.length },
        ]}
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <Input
          className="sm:max-w-xs"
          placeholder="Search agency, contact, email, city…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {activeTab === 'all' && (
          <Select className="sm:max-w-[180px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
          </Select>
        )}
      </div>

      {activeTab === 'pending' ? (
        <Table columns={pendingColumns} data={filteredPending} loading={loading} rowKey="id" emptyTitle="No pending requests" />
      ) : (
        <Table columns={allColumns} data={filteredAll} loading={loading} rowKey="id" emptyTitle="No agencies" />
      )}

      <ConfirmDialog
        open={!!dialog}
        title={dc.title}
        message={dc.message}
        confirmLabel={dc.confirmLabel}
        variant={dc.variant}
        withReason={dc.withReason}
        reasonRequired={dc.reasonRequired}
        reasonLabel="Rejection reason"
        loading={working}
        onConfirm={runDialog}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
