import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiPauseCircle, FiXCircle, FiArrowRight, FiLayers } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import { PageHeader, StatCard, Skeleton } from '../../components/ui';

const FALLBACK_IMG = '/images/placeholder-destination.svg';

/* A group picture card that links to that group's flights. */
function GroupCard({ name, to, imageUrl, all }) {
  return (
    <Link
      to={to}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 shadow-card transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-premium"
    >
      {all ? (
        <div className="absolute inset-0 bg-gradient-brand" />
      ) : (
        <img
          src={imageUrl || FALLBACK_IMG}
          alt={name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#071A36] via-[#071A36]/30 to-transparent" />
      {all && <FiLayers className="absolute right-4 top-4 text-white/80" size={22} />}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="h-px w-7 bg-accent transition-all duration-500 ease-premium group-hover:w-12" />
        <h3 className="mt-2.5 font-display text-base font-bold leading-tight text-white sm:text-lg">{name}</h3>
        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
          View flights <FiArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function AgencyDashboard() {
  const [stats, setStats] = useState({});
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [s, g] = await Promise.allSettled([
        apiClient.get('/api/dashboard/agency/stats'),
        apiClient.get('/api/groups'),
      ]);
      if (!alive) return;
      if (s.status === 'fulfilled') setStats(s.value.data || {});
      if (g.status === 'fulfilled') setGroups(Array.isArray(g.value.data) ? g.value.data : []);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 60000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  return (
    <div>
      <PageHeader title={`Welcome${stats.agencyName ? `, ${stats.agencyName}` : ''}`} subtitle="Your tickets at a glance — pick a group to browse flights and book." />

      {/* KPI cards — Sold / Hold / Cancelled only */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-[104px]" /><Skeleton className="h-[104px]" /><Skeleton className="h-[104px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Sold Tickets" value={stats.soldTickets ?? 0} tone="success" icon={<FiCheckCircle size={18} />} hint="Confirmed & issued" />
          <StatCard label="Hold Tickets" value={stats.holdTickets ?? 0} tone="warning" icon={<FiPauseCircle size={18} />} hint="Awaiting confirmation" />
          <StatCard label="Cancelled Tickets" value={stats.cancelledTickets ?? 0} tone="danger" icon={<FiXCircle size={18} />} hint="Cancelled bookings" />
        </div>
      )}

      {/* Available groups */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Available groups</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <GroupCard name="All Groups" to="/agency/search-flights" all />
            {groups.map((g) => (
              <GroupCard
                key={g.id}
                name={g.name}
                to={`/agency/search-flights?group=${encodeURIComponent(g.name)}`}
                imageUrl={g.imageUrl ? `${API_BASE_URL}${g.imageUrl}` : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
