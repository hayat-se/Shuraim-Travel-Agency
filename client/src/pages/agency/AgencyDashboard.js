import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCreditCard, FiCheckCircle, FiPauseCircle, FiList, FiArrowRight, FiDownload, FiMoreVertical,
  FiTrendingUp, FiTrendingDown,
} from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { Badge, Skeleton, EmptyState } from '../../components/ui';

const PKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Month-over-month change, computed from real data.
 *   tone 'positiveUp' → green when rising (bookings, sales)
 *   tone 'neutral'    → gray either way (outstanding balance: rising isn't "good")
 * Falls back to an absolute delta when the previous month was zero (percent is
 * meaningless against a zero base), and renders nothing when there's no history.
 */
function Delta({ current, previous, tone = 'positiveUp', money = false }) {
  const cur = Number(current || 0);
  const prev = Number(previous || 0);
  if (cur === prev) return null;
  if (prev === 0 && cur === 0) return null;

  const up = cur > prev;
  const Icon = up ? FiTrendingUp : FiTrendingDown;

  let text;
  if (prev === 0) {
    const diff = cur - prev;
    text = money ? `+${Number(diff).toLocaleString()}` : `+${diff}`;
  } else {
    text = `${up ? '+' : ''}${(((cur - prev) / Math.abs(prev)) * 100).toFixed(1)}%`;
  }

  const color = tone === 'neutral' ? 'text-neutral-500' : up ? 'text-success' : 'text-danger';

  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${color}`} title="vs. last month">
      <Icon size={13} /> {text}
    </span>
  );
}

/* KPI card matching the design: icon chip, label, value, optional badge/pulse/delta */
function Kpi({ icon, label, value, chip, pulse, loading, delta }) {
  if (loading) return <Skeleton className="h-[126px]" />;
  return (
    <div className="group rounded-sm border border-neutral-200 bg-white p-5 transition-colors hover:border-primary-200">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary-100/60 text-primary">{icon}</div>
        {chip && <span className="rounded-sm bg-neutral-200 px-2 py-1 text-xs text-neutral-600">{chip}</span>}
        {pulse && <span className="h-2 w-2 animate-pulse rounded-full bg-warning" />}
      </div>
      <h3 className="text-xs font-medium text-neutral-500">{label}</h3>
      <p className="mt-1 flex items-baseline gap-2 text-xl font-semibold text-neutral-900">
        {value}
        {delta}
      </p>
    </div>
  );
}

export default function AgencyDashboard() {
  const [stats, setStats] = useState({});
  const [ledger, setLedger] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [s, l, b] = await Promise.allSettled([
        apiClient.get('/api/dashboard/agency/stats'),
        apiClient.get('/api/ledger/my'),
        apiClient.get('/api/bookings/my-bookings'),
      ]);
      if (!alive) return;
      if (s.status === 'fulfilled') setStats(s.value.data || {});
      if (l.status === 'fulfilled') setLedger(l.value.data || null);
      if (b.status === 'fulfilled') setBookings(Array.isArray(b.value.data) ? b.value.data : []);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 60000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  const recent = useMemo(
    () => [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [bookings]
  );

  // Airline mix, computed from this agency's own bookings.
  const topAirlines = useMemo(() => {
    const map = new Map();
    bookings.forEach((b) => {
      const name = b.flight?.airlineName || 'Unknown';
      const prev = map.get(name) || { name, count: 0, amount: 0 };
      prev.count += 1;
      prev.amount += Number(b.totalPrice || 0);
      map.set(name, prev);
    });
    const total = bookings.length || 1;
    return [...map.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((a) => ({ ...a, pct: Math.round((a.count / total) * 100) }));
  }, [bookings]);

  // Month-over-month figures: this calendar month vs the previous one.
  const mom = useMemo(() => {
    const now = new Date();
    const startThis = new Date(now.getFullYear(), now.getMonth(), 1);
    const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonth = bookings.filter((b) => new Date(b.createdAt) >= startThis);
    const prevMonth = bookings.filter((b) => {
      const d = new Date(b.createdAt);
      return d >= startPrev && d < startThis;
    });

    // Balance carried at the close of last month = running balance of the last
    // ledger entry dated before this month started (entries are date-ascending).
    let balancePrev = 0;
    for (const e of ledger?.entries || []) {
      if (new Date(e.date) < startThis) balancePrev = Number(e.runningBalance || 0);
      else break;
    }

    return {
      bookings: { current: thisMonth.length, previous: prevMonth.length },
      sold: {
        current: thisMonth.filter((b) => b.status === 'sold').length,
        previous: prevMonth.filter((b) => b.status === 'sold').length,
      },
      balance: { current: Number(ledger?.summary?.balance || 0), previous: balancePrev },
    };
  }, [bookings, ledger]);

  // Booking volume for the last 6 months.
  const trend = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()], count: 0 };
    });
    bookings.forEach((b) => {
      const d = new Date(b.createdAt);
      const hit = buckets.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (hit) hit.count += 1;
    });
    const max = Math.max(...buckets.map((b) => b.count), 1);
    return buckets.map((b) => ({ ...b, pct: Math.round((b.count / max) * 100) }));
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Overview</h2>
          <p className="mt-1 text-base text-neutral-600">
            {stats.agencyName ? `Welcome back, ${stats.agencyName}.` : 'Welcome back.'} Here is your agency’s activity.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/agency/ledger"
            className="flex items-center gap-2 rounded-sm border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
          >
            <FiDownload size={14} /> View Ledger
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Kpi
          loading={loading}
          icon={<FiCreditCard size={20} />}
          label="Outstanding Balance"
          value={PKR(ledger?.summary?.balance)}
          chip="PKR"
          delta={<Delta {...mom.balance} tone="neutral" money />}
        />
        <Kpi
          loading={loading}
          icon={<FiCheckCircle size={20} />}
          label="Sold Tickets"
          value={stats.soldTickets ?? 0}
          delta={<Delta {...mom.sold} />}
        />
        <Kpi
          loading={loading}
          icon={<FiPauseCircle size={20} />}
          label="Hold Tickets"
          value={stats.holdTickets ?? 0}
          pulse={(stats.holdTickets ?? 0) > 0}
        />
        <Kpi
          loading={loading}
          icon={<FiList size={20} />}
          label="Total Bookings"
          value={bookings.length}
          delta={<Delta {...mom.bookings} />}
        />
      </div>

      {/* Table + side panel */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent bookings */}
        <div className="flex flex-col overflow-hidden rounded-sm border border-neutral-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-200 p-5">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Bookings</h3>
            <Link to="/agency/my-bookings" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View All <FiArrowRight size={13} />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : recent.length === 0 ? (
              <EmptyState
                title="No bookings yet"
                message="Your recent bookings will appear here."
                action={
                  <Link to="/agency/search-flights" className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600">
                    Search Flights
                  </Link>
                }
              />
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    {['Booking ID', 'Passenger', 'Route', 'Date', 'Status', 'Amount'].map((h, i) => (
                      <th
                        key={h}
                        className={`p-4 text-xs font-semibold text-neutral-500 ${i === 5 ? 'text-right' : ''}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recent.map((b) => {
                    const p = Array.isArray(b.passengers) ? b.passengers[0] : null;
                    const name = p ? (p.givenName ? `${p.givenName} ${p.surname || ''}`.trim() : p.name || '—') : '—';
                    return (
                      <tr key={b.id} className="border-b border-neutral-200 transition-colors last:border-0 hover:bg-neutral-100/60">
                        <td className="p-4 font-semibold text-primary">{b.bookingId}</td>
                        <td className="p-4 text-neutral-900">{name}</td>
                        <td className="p-4 text-neutral-600">
                          {b.flight?.departureCity || '—'} <span className="mx-1 text-neutral-400">→</span> {b.flight?.destinationCity || '—'}
                        </td>
                        <td className="p-4 text-neutral-600">
                          {b.flight?.departureDate ? new Date(b.flight.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="p-4"><Badge status={b.status} /></td>
                        <td className="p-4 text-right font-medium text-neutral-900">{PKR(b.totalPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col rounded-sm border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 p-5">
            <h3 className="text-lg font-semibold text-neutral-900">Top Airlines</h3>
            <FiMoreVertical className="text-neutral-500" size={18} />
          </div>

          <div className="flex-1 space-y-4 p-5">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)
            ) : topAirlines.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-500">No booking data yet.</p>
            ) : (
              topAirlines.map((a) => (
                <div key={a.name} className="-mx-2 flex items-center justify-between rounded-sm p-2 transition-colors hover:bg-neutral-100">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-neutral-200 bg-white text-xs font-bold text-primary">
                      {a.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">{a.name}</p>
                      <p className="text-xs text-neutral-500">{a.pct}% of bookings</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-neutral-900">{PKR(a.amount)}</p>
                </div>
              ))
            )}

            {/* Volume trend */}
            <div className="mt-6 border-t border-neutral-200 pt-4">
              <h4 className="mb-3 text-xs font-medium text-neutral-500">Booking Volume · Last 6 months</h4>
              <div className="flex h-20 w-full items-end gap-1.5 px-1">
                {trend.map((t, i) => (
                  <div key={t.key} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      title={`${t.label}: ${t.count}`}
                      style={{ height: `${Math.max(t.pct, 4)}%` }}
                      className={`w-full rounded-t-sm transition-all duration-500 ${
                        i === trend.length - 1 ? 'bg-primary' : 'bg-primary-200'
                      }`}
                    />
                    <span className="text-[10px] text-neutral-500">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
