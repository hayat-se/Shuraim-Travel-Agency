import React, { useEffect, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { PageHeader, Card, CardHeader, CardBody, Table, Badge, Button, FormField, Input, Select, Textarea, useToast } from '../../components/ui';

const PKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;
const EMPTY = { bankId: '', amount: '', referenceNumber: '', paymentDate: '', proofUrl: '', notes: '' };

export default function Payments() {
  const toast = useToast();
  const [banks, setBanks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [banksRes, paymentsRes] = await Promise.all([
        apiClient.get('/api/banks'),
        apiClient.get('/api/payments/my'),
      ]);
      setBanks(Array.isArray(banksRes.data) ? banksRes.data : []);
      setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/api/payments', { ...form, amount: Number(form.amount) });
      setForm(EMPTY);
      toast.success('Payment submitted — pending admin review.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error submitting payment');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'date', header: 'Date', render: (p) => new Date(p.paymentDate || p.createdAt).toLocaleDateString('en-GB') },
    { key: 'bank', header: 'Bank', render: (p) => p.bank?.bankName || 'Bank' },
    { key: 'referenceNumber', header: 'Reference', render: (p) => <span className="font-mono">{p.referenceNumber}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (p) => PKR(p.amount) },
    { key: 'status', header: 'Status', render: (p) => <Badge status={p.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Payments" subtitle="Submit payment proofs and track their status." />

      <Card className="mb-5">
        <CardHeader title="Submit a payment" />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Bank" htmlFor="bankId" required>
                <Select id="bankId" value={form.bankId} onChange={set('bankId')} required>
                  <option value="">Select bank</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>{b.bankName} — {b.accountTitle}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Amount (PKR)" htmlFor="amount" required>
                <Input id="amount" type="number" min="1" value={form.amount} onChange={set('amount')} required />
              </FormField>
              <FormField label="Reference / Transaction ID" htmlFor="referenceNumber" required>
                <Input id="referenceNumber" value={form.referenceNumber} onChange={set('referenceNumber')} required />
              </FormField>
              <FormField label="Payment Date" htmlFor="paymentDate">
                <Input id="paymentDate" type="date" value={form.paymentDate} onChange={set('paymentDate')} />
              </FormField>
              <FormField label="Proof URL (optional)" htmlFor="proofUrl" className="sm:col-span-2">
                <Input id="proofUrl" value={form.proofUrl} onChange={set('proofUrl')} placeholder="Link to receipt / screenshot" />
              </FormField>
            </div>
            <FormField label="Notes (optional)" htmlFor="notes">
              <Textarea id="notes" rows={3} value={form.notes} onChange={set('notes')} />
            </FormField>
            <Button type="submit" icon={<FiSend size={14} />} loading={submitting}>Submit Payment</Button>
          </form>
        </CardBody>
      </Card>

      <h2 className="mb-3 text-base font-semibold text-ink">My Payments</h2>
      <Table columns={columns} data={payments} loading={loading} rowKey="id" emptyTitle="No payments yet" />
    </div>
  );
}
