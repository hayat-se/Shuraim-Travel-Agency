import React, { useState, useEffect, useMemo } from 'react';
import { FiDownload } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';
import { PageHeader, Table, Badge, Button, Tabs, useToast } from '../../components/ui';

const PKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

export default function MyBookings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.GET_MY_BOOKINGS);
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => (tab === 'all' ? bookings : bookings.filter((b) => b.status === tab)),
    [bookings, tab]
  );

  const count = (s) => bookings.filter((b) => b.status === s).length;

  const columns = [
    { key: 'bookingId', header: 'Booking ID', render: (b) => <span className="font-mono font-medium text-primary">{b.bookingId}</span> },
    { key: 'route', header: 'Route', render: (b) => (b.flight ? `${b.flight.departureCity} → ${b.flight.destinationCity}` : '—') },
    { key: 'flight', header: 'Flight', render: (b) => b.flight?.flightNumber || '—' },
    { key: 'date', header: 'Departure', render: (b) => (b.flight?.departureDate ? new Date(b.flight.departureDate).toLocaleDateString('en-GB') : '—') },
    { key: 'passengers', header: 'Pax', render: (b) => (Array.isArray(b.passengers) ? b.passengers.length : 0) },
    { key: 'totalPrice', header: 'Amount', align: 'right', render: (b) => PKR(b.totalPrice) },
    { key: 'status', header: 'Status', render: (b) => <Badge status={b.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) =>
        b.ticketGenerated ? (
          <a href={`${API_BASE_URL}/api/tickets/download/${b.bookingId}`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" icon={<FiDownload size={13} />}>E-Ticket</Button>
          </a>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="My Bookings" subtitle="Your bookings and e-tickets." />

      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'all', label: 'All', count: bookings.length },
          { value: 'sold', label: 'Sold', count: count('sold') },
          { value: 'hold', label: 'Hold', count: count('hold') },
          { value: 'pending', label: 'Pending', count: count('pending') },
          { value: 'cancelled', label: 'Cancelled', count: count('cancelled') },
        ]}
      />

      <Table columns={columns} data={filtered} loading={loading} rowKey="bookingId" emptyTitle="No bookings yet" emptyMessage="Search for a flight to make your first booking." />
    </div>
  );
}
