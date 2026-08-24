import React, { useEffect, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { PageHeader, Card, CardHeader, CardBody, Table, Badge, Button, FormField, Input, Select, Textarea, useToast } from '../../components/ui';

const EMPTY = { rating: '5', category: 'general', subject: '', message: '' };
const Stars = ({ n }) => <span className="text-warning">{'★'.repeat(n)}<span className="text-neutral-300">{'★'.repeat(5 - n)}</span></span>;

export default function GiveFeedback() {
  const toast = useToast();
  const [feedbackList, setFeedbackList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFeedback = async () => {
    try {
      const res = await apiClient.get('/api/feedback/my');
      setFeedbackList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error loading feedback');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/api/feedback', { ...form, rating: Number(form.rating) });
      setForm(EMPTY);
      toast.success('Thanks for your feedback!');
      loadFeedback();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'createdAt', header: 'Date', render: (f) => new Date(f.createdAt).toLocaleDateString('en-GB') },
    { key: 'category', header: 'Category', render: (f) => <span className="capitalize">{f.category}</span> },
    { key: 'rating', header: 'Rating', render: (f) => <Stars n={f.rating} /> },
    { key: 'subject', header: 'Subject', render: (f) => f.subject || '—' },
    { key: 'status', header: 'Status', render: (f) => <Badge status={f.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Give Feedback" subtitle="Tell us how we’re doing." />

      <Card className="mb-5">
        <CardHeader title="Submit feedback" />
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Rating" htmlFor="rating" required>
                <Select id="rating" value={form.rating} onChange={set('rating')} required>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} Star{n === 1 ? '' : 's'}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Category" htmlFor="category">
                <Select id="category" value={form.category} onChange={set('category')}>
                  <option value="general">General</option>
                  <option value="booking">Booking</option>
                  <option value="payment">Payment</option>
                  <option value="technical">Technical</option>
                  <option value="other">Other</option>
                </Select>
              </FormField>
              <FormField label="Subject (optional)" htmlFor="subject">
                <Input id="subject" value={form.subject} onChange={set('subject')} />
              </FormField>
            </div>
            <FormField label="Message" htmlFor="message" required>
              <Textarea id="message" rows={4} value={form.message} onChange={set('message')} placeholder="Write your feedback…" required />
            </FormField>
            <Button type="submit" icon={<FiSend size={14} />} loading={submitting}>Submit Feedback</Button>
          </form>
        </CardBody>
      </Card>

      <h2 className="mb-3 text-base font-semibold text-ink">My Feedback</h2>
      <Table columns={columns} data={feedbackList} loading={loading} rowKey="id" emptyTitle="No feedback yet" />
    </div>
  );
}
