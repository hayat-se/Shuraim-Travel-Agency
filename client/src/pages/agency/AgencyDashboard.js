import React, { useState, useEffect } from 'react';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
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
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchGroups();
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

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get('/api/groups');
      setGroups(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
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
        {groups.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No flight groups available yet.</p>
        ) : (
          <div className="group-filter-dashboard">
            <a href="/agency/search-flights" className="group-btn-dashboard">
              <div className="group-card-image" style={{ background: 'linear-gradient(135deg, #0d2137 0%, #1a3a5c 100%)' }}>
                <i className="fa-solid fa-globe"></i>
                <div className="group-card-overlay"></div>
              </div>
              <div className="group-card-name">All Flights</div>
            </a>
            {groups.map((group) => (
              <a key={group.id} href={`/agency/search-flights?group=${group.name}`} className="group-btn-dashboard">
                <div className="group-card-image" style={group.imageUrl ? { backgroundImage: `url(${API_BASE_URL}${group.imageUrl})` } : undefined}>
                  {!group.imageUrl && <i className="fa-solid fa-layer-group"></i>}
                  <div className="group-card-overlay"></div>
                </div>
                <div className="group-card-name">{group.name}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyDashboard;
