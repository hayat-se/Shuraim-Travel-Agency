import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiPauseCircle, FiXCircle, FiSearch, FiGlobe } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import { PageHeader, StatCard, Card, Skeleton, EmptyState, Button } from '../../components/ui';

const AgencyDashboard = () => {
  const [stats, setStats] = useState({ soldTickets: 0, holdTickets: 0, cancelledTickets: 0, agencyName: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/api/dashboard/agency/stats');
        setStats(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    const fetchGroups = async () => {
      try {
        const res = await apiClient.get('/api/groups');
        setGroups(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
    fetchGroups();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <PageHeader
        title={stats.agencyName ? `Welcome, ${stats.agencyName}` : 'Agency Dashboard'}
        subtitle={stats.city ? `Based in ${stats.city}` : 'Your bookings at a glance.'}
        actions={
          <Link to="/agency/search-flights">
            <Button icon={<FiSearch size={16} />}>Search Flights</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Sold Tickets" value={stats.soldTickets} icon={<FiCheckCircle size={20} />} tone="success" />
          <StatCard label="Hold Tickets" value={stats.holdTickets} icon={<FiPauseCircle size={20} />} tone="warning" />
          <StatCard label="Cancelled Tickets" value={stats.cancelledTickets} icon={<FiXCircle size={20} />} tone="danger" />
        </div>
      )}

      <h2 className="mb-3 mt-8 text-lg font-semibold text-ink">Flight Groups</h2>
      <Card className="p-5">
        {groups.length === 0 ? (
          <EmptyState title="No flight groups yet" message="Groups will appear here once the admin adds them." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <Link to="/agency/search-flights" className="group overflow-hidden rounded-sm border border-neutral-200 transition-shadow hover:shadow-card">
              <div className="flex h-24 items-center justify-center bg-gradient-to-br from-ink to-primary-700 text-white">
                <FiGlobe size={26} />
              </div>
              <div className="px-2 py-2 text-center text-sm font-medium text-neutral-700">All Flights</div>
            </Link>
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/agency/search-flights?group=${group.name}`}
                className="group overflow-hidden rounded-sm border border-neutral-200 transition-shadow hover:shadow-card"
              >
                <div
                  className="flex h-24 items-center justify-center bg-neutral-100 bg-cover bg-center text-neutral-400"
                  style={group.imageUrl ? { backgroundImage: `url(${API_BASE_URL}${group.imageUrl})` } : undefined}
                >
                  {!group.imageUrl && <FiGlobe size={26} />}
                </div>
                <div className="px-2 py-2 text-center text-sm font-medium text-neutral-700">{group.name}</div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AgencyDashboard;
