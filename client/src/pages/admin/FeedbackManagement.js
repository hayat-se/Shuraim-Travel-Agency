import React, { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { PageHeader, Table, Badge, Button, Input, useToast } from '../../components/ui';

const Stars = ({ n }) => (
  <span className="text-warning" aria-label={`${n} star${n === 1 ? '' : 's'}`}>
    {'★'.repeat(Math.max(0, Math.min(5, n || 0)))}
    <span className="text-neutral-300">{'★'.repeat(5 - Math.max(0, Math.min(5, n || 0)))}</span>
  </span>
);

export default function FeedbackManagement() {
  const toast = useToast();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMap, setReplyMap] = useState({});
  const [busy, setBusy] = useState({});

  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFeedback = async () => {
    try {
      const res = await apiClient.get('/api/feedback/admin');
      setFeedback(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error loading feedback');
    } finally {
      setLoading(false);
    }
  };

  const markReviewed = async (item) => {
    setBusy((p) => ({ ...p, [item.id]: true }));
    try {
      await apiClient.put(`/api/feedback/admin/${item.id}`, { status: 'reviewed', adminReply: replyMap[item.id] || null });
      toast.success('Feedback marked reviewed');
      loadFeedback();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error updating feedback');
    } finally {
      setBusy((p) => ({ ...p, [item.id]: false }));
    }
  };

  const columns = [
    { key: 'createdAt', header: 'Date', render: (f) => new Date(f.createdAt).toLocaleDateString('en-GB') },
    { key: 'agency', header: 'Agency', render: (f) => f.agency?.agencyName || 'Agency' },
    { key: 'category', header: 'Category', render: (f) => <span className="capitalize">{f.category}</span> },
    { key: 'rating', header: 'Rating', render: (f) => <Stars n={f.rating} /> },
    { key: 'message', header: 'Message', className: 'max-w-xs whitespace-normal', render: (f) => <span className="text-neutral-600">{f.message}</span> },
    { key: 'status', header: 'Status', render: (f) => <Badge status={f.status} /> },
    {
      key: 'reply',
      header: 'Reply',
      render: (f) =>
        f.status !== 'reviewed' ? (
          <Input
            className="min-w-[160px]"
            value={replyMap[f.id] || ''}
            onChange={(e) => setReplyMap((prev) => ({ ...prev, [f.id]: e.target.value }))}
            placeholder="Optional reply…"
          />
        ) : (
          <span className="text-neutral-500">{f.adminReply || '—'}</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (f) =>
        f.status !== 'reviewed' ? (
          <Button size="sm" variant="success" icon={<FiCheck size={13} />} loading={busy[f.id]} onClick={() => markReviewed(f)}>Reviewed</Button>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Agency Feedback" subtitle="Review and reply to agency feedback." />
      <Table columns={columns} data={feedback} loading={loading} rowKey="id" emptyTitle="No feedback yet" />
    </div>
  );
}
