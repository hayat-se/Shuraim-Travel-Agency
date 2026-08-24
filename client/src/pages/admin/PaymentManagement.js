import React, { useEffect, useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { PageHeader, Table, Badge, Button, useToast } from '../../components/ui';

const PKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

export default function PaymentManagement() {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPayments = async () => {
    try {
      const res = await apiClient.get('/api/payments/admin');
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (payment, status) => {
    setBusy((p) => ({ ...p, [payment.id]: true }));
    try {
      await apiClient.put(`/api/payments/admin/${payment.id}/status`, { status });
      toast.success(`Payment ${status}`);
      loadPayments();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error updating payment');
    } finally {
      setBusy((p) => ({ ...p, [payment.id]: false }));
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (p) => new Date(p.paymentDate || p.createdAt).toLocaleDateString('en-GB') },
    { key: 'agency', header: 'Agency', render: (p) => p.agency?.agencyName || 'Agency' },
    { key: 'bank', header: 'Bank', render: (p) => p.bank?.bankName || 'Bank' },
    { key: 'referenceNumber', header: 'Reference', render: (p) => <span className="font-mono">{p.referenceNumber}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (p) => PKR(p.amount) },
    { key: 'status', header: 'Status', render: (p) => <Badge status={p.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) =>
        p.status === 'pending' ? (
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="success" icon={<FiCheck size={13} />} loading={busy[p.id]} onClick={() => updateStatus(p, 'approved')}>Approve</Button>
            <Button size="sm" variant="danger" icon={<FiX size={13} />} disabled={busy[p.id]} onClick={() => updateStatus(p, 'rejected')}>Reject</Button>
          </div>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Payment Approvals" subtitle="Verify agency payment submissions." />
      <Table columns={columns} data={payments} loading={loading} rowKey="id" emptyTitle="No payments submitted yet" />
    </div>
  );
}
