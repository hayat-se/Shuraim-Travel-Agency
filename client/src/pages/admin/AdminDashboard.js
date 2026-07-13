import React, { useState, useEffect } from 'react';
import { FiSend, FiList, FiDollarSign, FiUsers, FiClock, FiCheckCircle, FiPauseCircle, FiXCircle } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { PageHeader, StatCard, Skeleton } from '../../components/ui';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/api/dashboard/admin/stats');
        setStats(res.data);
      } catch (e) {
        console.error('Error fetching stats:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const s = stats || {};
  const tiles = [
    { label: 'Active Flights', value: s.totalFlights ?? 0, icon: <FiSend size={20} />, tone: 'primary' },
    { label: 'Total Bookings', value: s.totalBookings ?? 0, icon: <FiList size={20} />, tone: 'primary' },
    { label: 'Total Revenue', value: `PKR ${Number(s.totalRevenue || 0).toLocaleString()}`, icon: <FiDollarSign size={20} />, tone: 'success' },
    { label: 'Approved Agencies', value: s.totalAgencies ?? 0, icon: <FiUsers size={20} />, tone: 'primary' },
    { label: 'Pending Approvals', value: s.pendingAgencies ?? 0, icon: <FiClock size={20} />, tone: 'warning' },
    { label: 'Sold Tickets', value: s.soldTickets ?? 0, icon: <FiCheckCircle size={20} />, tone: 'success' },
    { label: 'Hold Tickets', value: s.holdTickets ?? 0, icon: <FiPauseCircle size={20} />, tone: 'warning' },
    { label: 'Cancelled Tickets', value: s.canceledTickets ?? 0, icon: <FiXCircle size={20} />, tone: 'danger' },
  ];

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Overview of flights, bookings and agencies." />
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((t) => <StatCard key={t.label} {...t} />)}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
