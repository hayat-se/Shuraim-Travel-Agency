import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiSend, FiMapPin, FiPackage, FiCalendar, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import AIRLINE_PRESETS from '../../config/airlinePresets';
import { Button, Badge, EmptyState, Skeleton, cn } from '../../components/ui';

const ease = [0.16, 1, 0.3, 1];
const TRIP_LABEL = { connecting: 'Connecting', two_way: 'Two-way' };

const getAirlineLogo = (airlineName) => {
  const preset = AIRLINE_PRESETS.find((a) => a.name.toLowerCase() === (airlineName || '').toLowerCase());
  return preset ? preset.logo : null;
};

const SearchFlights = () => {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const group = searchParams.get('group') || ''; // '' = all flights

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Group flights by airline AND sector — same airline on a different route is its own section.
  const sections = useMemo(() => {
    const grouped = {};
    flights.forEach((f) => {
      const key = `${f.airlineName || 'Unknown'}__${f.departureCity || ''}__${f.destinationCity || ''}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(f);
    });
    const keys = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
    keys.forEach((k) => grouped[k].sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate)));
    return keys.map((k) => ({ key: k, flights: grouped[k], first: grouped[k][0] }));
  }, [flights]);

  useEffect(() => {
    const loadFlights = async () => {
      setLoading(true);
      setError('');
      try {
        const qs = group ? `?group=${encodeURIComponent(group)}` : '';
        const response = await apiClient.get(`/api/admin/flights/search${qs}`);
        setFlights(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Error loading flights');
      } finally {
        setLoading(false);
      }
    };
    loadFlights();
  }, [group]);

  const handleBook = (flightId) => navigate(`/agency/book/${flightId}`);

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.5, ease } },
  };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } };

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6">
        <Link to="/agency/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-primary">
          <FiArrowLeft size={15} /> Back to dashboard
        </Link>
        <div className="mt-3 flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary-200 bg-gradient-chip text-primary-700 shadow-inner-soft">
            <FiSend size={20} />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-ink sm:text-2xl">{group ? group : 'All'} Flights</h1>
            <p className="mt-1 text-sm text-neutral-500">Flights are grouped by airline and sector. Pick one and book.</p>
          </div>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
              <div className="flex items-center gap-4 border-b border-neutral-200/80 bg-gradient-header px-5 py-4">
                <Skeleton className="h-11 w-28 shrink-0" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-28" /></div>
              </div>
              <div className="space-y-2 p-5"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <FiAlertTriangle size={18} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && flights.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-card">
          <EmptyState icon={<FiSend size={22} />} title="No flights found" message="There are no flights in this group yet. Check back soon or try another group." />
        </div>
      )}

      {/* ── Results ── */}
      {!loading && !error && flights.length > 0 && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          {sections.map(({ key, flights: sectionFlights, first }) => {
            const airlineName = first.airlineName || 'Unknown Airline';
            const airlineLogo = getAirlineLogo(airlineName);
            const route = `${first.departureCity || 'N/A'} - ${first.destinationCity || 'N/A'}`;
            return (
              <motion.div
                key={key}
                variants={fadeUp}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-premium"
              >
                {/* Airline + sector header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/80 bg-gradient-header px-5 py-4">
                  <div className="flex min-w-0 items-center gap-4">
                    {airlineLogo ? (
                      <img src={airlineLogo} alt={airlineName} className="h-11 w-28 shrink-0 rounded-lg border border-neutral-200 bg-white object-contain p-1.5" />
                    ) : (
                      <div className="flex h-11 w-28 shrink-0 items-center justify-center rounded-lg border border-primary-200 bg-gradient-chip text-primary-700"><FiSend size={20} /></div>
                    )}
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-ink">{airlineName}</h2>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-neutral-500">
                        <FiMapPin size={12} className="shrink-0 text-primary" /> {route}
                      </p>
                    </div>
                  </div>
                  <Badge tone="primary" dot={false} className="shrink-0">
                    {sectionFlights.length} {sectionFlights.length === 1 ? 'Flight' : 'Flights'}
                  </Badge>
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/60">
                        <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary-800">Date</th>
                        <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary-800">Time</th>
                        <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-primary-800">Baggage</th>
                        <th className="whitespace-nowrap px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-primary-800">Meal</th>
                        <th className="whitespace-nowrap px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-primary-800">Seats</th>
                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-primary-800">Fare</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {sectionFlights.map((flight) => {
                        const hasMeal = flight.meal === 'Yes' || flight.meal === 'yes';
                        const full = flight.seatsRemaining === 0;
                        const seatsLow = !full && flight.seatsRemaining < 10;
                        const trip = TRIP_LABEL[flight.flightType];
                        return (
                          <tr key={flight.id} className={cn('border-b border-neutral-100 transition-colors duration-150 ease-premium last:border-0 hover:bg-primary-50/60', seatsLow && 'bg-amber-50/40')}>
                            <td className="whitespace-nowrap px-5 py-3.5 font-medium text-neutral-800">
                              {new Date(flight.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              {trip && <span className="ml-2 rounded-sm bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-700">{trip}</span>}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-neutral-600">
                              <span className="font-semibold text-primary-700">{flight.departureTime}</span>
                              <span className="mx-1 text-neutral-400">–</span>{flight.arrivalTime}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-neutral-600">
                              <span className="inline-flex items-center gap-1.5"><FiPackage size={13} className="text-neutral-400" />{flight.baggage || '20+7 KG'}</span>
                            </td>
                            <td className="px-5 py-3.5 text-center"><Badge tone={hasMeal ? 'success' : 'neutral'}>{hasMeal ? 'Yes' : 'No'}</Badge></td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={cn('font-semibold', full ? 'text-neutral-400' : seatsLow ? 'text-danger' : 'text-success')}>{flight.seatsRemaining}</span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold text-ink">{parseInt(flight.pricePerSeat).toLocaleString()} PKR</td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-right">
                              <Button size="sm" disabled={full} onClick={() => handleBook(flight.id)}>{full ? 'Full' : 'Book Now'}</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 p-4 sm:hidden">
                  {sectionFlights.map((flight) => {
                    const hasMeal = flight.meal === 'Yes' || flight.meal === 'yes';
                    const full = flight.seatsRemaining === 0;
                    const seatsLow = !full && flight.seatsRemaining < 10;
                    const trip = TRIP_LABEL[flight.flightType];
                    return (
                      <div key={flight.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
                        <div className="flex items-center justify-between bg-neutral-50 px-4 py-2.5">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                            <FiCalendar size={12} className="text-primary" />
                            {new Date(flight.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {trip && <span className="ml-1 rounded-sm bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-700">{trip}</span>}
                          </span>
                          <span className="font-mono text-xs font-semibold text-neutral-500">{flight.flightNumber}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 px-4 py-3">
                          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Time</p><p className="mt-0.5 text-sm font-medium text-neutral-800">{flight.departureTime} – {flight.arrivalTime}</p></div>
                          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Baggage</p><p className="mt-0.5 text-sm font-medium text-neutral-800">{flight.baggage || '20+7 KG'}</p></div>
                          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Meal</p><div className="mt-1"><Badge tone={hasMeal ? 'success' : 'neutral'}>{hasMeal ? 'Yes' : 'No'}</Badge></div></div>
                          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Seats</p><p className={cn('mt-0.5 text-sm font-semibold', full ? 'text-neutral-400' : seatsLow ? 'text-danger' : 'text-success')}>{flight.seatsRemaining}</p></div>
                        </div>
                        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/60 px-4 py-3">
                          <div><p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Fare</p><p className="text-base font-bold text-ink">{parseInt(flight.pricePerSeat).toLocaleString()} PKR</p></div>
                          <Button size="sm" disabled={full} onClick={() => handleBook(flight.id)}>{full ? 'Full' : 'Book Now'}</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default SearchFlights;
