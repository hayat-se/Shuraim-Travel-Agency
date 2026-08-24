import React, { useEffect, useState } from 'react';
import { FiArrowDownCircle, FiArrowUpCircle, FiCreditCard } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { PageHeader, StatCard, Table, Badge, useToast } from '../../components/ui';

const PKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

export default function MyLedger() {
  const toast = useToast();
  const [summary, setSummary] = useState({ totalDebit: 0, totalCredit: 0, balance: 0 });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLedger = async () => {
    try {
      const res = await apiClient.get('/api/ledger/my');
      setSummary(res.data?.summary || { totalDebit: 0, totalCredit: 0, balance: 0 });
      setEntries(Array.isArray(res.data?.entries) ? res.data.entries : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error loading ledger');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (e) => new Date(e.date).toLocaleDateString('en-GB') },
    { key: 'type', header: 'Type', render: (e) => <Badge tone={e.type === 'debit' ? 'danger' : 'success'}>{e.type}</Badge> },
    { key: 'description', header: 'Description', render: (e) => <span className="text-neutral-700">{e.description}</span> },
    { key: 'reference', header: 'Reference', render: (e) => <span className="font-mono text-neutral-500">{e.reference}</span> },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (e) => (
        <span className={e.type === 'debit' ? 'font-medium text-danger' : 'font-medium text-success'}>
          {e.type === 'debit' ? '−' : '+'}{PKR(e.amount)}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (e) => <Badge status={e.status} /> },
    { key: 'runningBalance', header: 'Balance', align: 'right', render: (e) => <span className="font-medium text-ink">{PKR(e.runningBalance)}</span> },
  ];

  return (
    <div>
      <PageHeader title="My Ledger" subtitle="Your account activity and running balance." />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Charges" value={PKR(summary.totalDebit)} icon={<FiArrowUpCircle size={18} />} tone="danger" />
        <StatCard label="Total Payments" value={PKR(summary.totalCredit)} icon={<FiArrowDownCircle size={18} />} tone="success" />
        <StatCard label="Outstanding Balance" value={PKR(summary.balance)} icon={<FiCreditCard size={18} />} tone="primary" />
      </div>

      <Table columns={columns} data={entries} loading={loading} rowKey="id" emptyTitle="No ledger entries yet" emptyMessage="Bookings and payments will appear here." />
    </div>
  );
}
