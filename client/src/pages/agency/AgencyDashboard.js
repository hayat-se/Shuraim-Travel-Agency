import React, { useState, useEffect } from 'react';
import apiClient from '../../config/axiosConfig';
import '../../styles/Dashboard.css';

const AgencyDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    soldTickets: 0,
    holdTickets: 0,
    cancelledTickets: 0,
    agencyName: '',
    city: ''
  });
  const [loading, setLoading] = useState(true);
  
  const groups = ['ALL', 'KSA', 'UAE', 'QATAR', 'BAHRAIN', 'OMAN', 'KUWAIT'];

  const groupIcons = {
    'ALL': 'fa-globe',
    'KSA': 'fa-mosque',
    'UAE': 'fa-city',
    'QATAR': 'fa-gopuram',
    'BAHRAIN': 'fa-umbrella-beach',
    'OMAN': 'fa-mountain',
    'KUWAIT': 'fa-landmark'
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds to show updated ticket counts
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/dashboard/agency/stats');
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
      <h1>Agency Dashboard</h1>

      <div className="stats-grid">
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
          <p className="stat-number">{stats.cancelledTickets}</p>
        </div>
      </div>

      <div className="flight-groups-section">
        <h2><i className="fa-solid fa-plane"></i> Flight Groups</h2>
        <div className="group-filter-dashboard">
          {groups.map((group) => (
            <a key={group} href={`/agency/search-flights?group=${group}`} className="group-btn-dashboard">
              <div className="group-card-image">
                <i className={`fa-solid ${groupIcons[group]}`}></i>
              </div>
              <div className="group-card-name">{group}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
