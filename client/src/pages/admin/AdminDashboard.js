import React, { useState, useEffect } from 'react';
import apiClient from '../../config/axiosConfig';
import '../../styles/Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalFlights: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalAgencies: 0,
    pendingAgencies: 0,
    soldTickets: 0,
    holdTickets: 0,
    canceledTickets: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/dashboard/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Flights</h3>
          <p className="stat-number">{stats.totalFlights}</p>
        </div>

        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{stats.totalBookings}</p>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">PKR {stats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <h3>Approved Agencies</h3>
          <p className="stat-number">{stats.totalAgencies}</p>
        </div>

        <div className="stat-card warning">
          <h3><i className="fa-solid fa-exclamation-triangle"></i> Pending Approvals</h3>
          <p className="stat-number">{stats.pendingAgencies}</p>
        </div>

        <div className="stat-card sold">
          <h3><i className="fa-solid fa-check-circle"></i> Sold Tickets</h3>
          <p className="stat-number">{stats.soldTickets}</p>
        </div>

        <div className="stat-card hold">
          <h3><i className="fa-solid fa-pause-circle"></i> Hold Tickets</h3>
          <p className="stat-number">{stats.holdTickets}</p>
        </div>

        <div className="stat-card canceled">
          <h3><i className="fa-solid fa-times-circle"></i> Cancelled Tickets</h3>
          <p className="stat-number">{stats.canceledTickets}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
