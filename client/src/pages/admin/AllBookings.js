import React, { useState, useEffect } from 'react';
import { FiCheck, FiXCircle } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { PageHeader, Table, Badge, Button, ConfirmDialog, useToast } from '../../components/ui';

const PKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

export default function AllBookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.GET_ALL_BOOKINGS);
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error fetching bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (b) => {
    setBusy((p) => ({ ...p, [b.bookingId]: true }));
    try {
      await apiClient.put(`/api/bookings/${b.bookingId}/confirm`);
      toast.success(`Booking ${b.bookingId} confirmed & sold`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error confirming booking');
    } finally {
      setBusy((p) => ({ ...p, [b.bookingId]: false }));
    }
  };

  const cancelBooking = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await apiClient.put(`/api/bookings/${cancelTarget.bookingId}/cancel`);
      toast.success(`Booking ${cancelTarget.bookingId} cancelled`);
      setCancelTarget(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error cancelling booking');
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    { key: 'bookingId', header: 'Booking ID', render: (b) => <span className="font-mono font-medium text-primary">{b.bookingId}</span> },
    { key: 'agency', header: 'Agency', render: (b) => b.agency?.agencyName || 'Guest' },
    { key: 'flight', header: 'Flight', render: (b) => (b.flight ? `${b.flight.flightNumber} · ${b.flight.departureCity}→${b.flight.destinationCity}` : '—') },
    { key: 'seatsBooked', header: 'Seats', render: (b) => b.seatsBooked },
    { key: 'totalPrice', header: 'Amount', align: 'right', render: (b) => PKR(b.totalPrice) },
    { key: 'status', header: 'Status', render: (b) => <Badge status={b.status} /> },
    { key: 'createdAt', header: 'Created', render: (b) => new Date(b.createdAt).toLocaleDateString('en-GB') },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (b) =>
        b.status === 'pending' ? (
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="success" icon={<FiCheck size={13} />} loading={busy[b.bookingId]} onClick={() => confirmBooking(b)}>Confirm</Button>
            <Button size="sm" variant="danger" icon={<FiXCircle size={13} />} disabled={busy[b.bookingId]} onClick={() => setCancelTarget(b)}>Cancel</Button>
          </div>
        ) : (
          <span className="text-xs text-neutral-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="All Bookings" subtitle="Confirm pending bookings or cancel them." />
      <Table columns={columns} data={bookings} loading={loading} rowKey="bookingId" emptyTitle="No bookings yet" />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel booking?"
        message={cancelTarget ? `Cancel booking ${cancelTarget.bookingId}? Seats will be released back to the flight.` : ''}
        confirmLabel="Cancel Booking"
        variant="danger"
        loading={cancelling}
        onConfirm={cancelBooking}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
