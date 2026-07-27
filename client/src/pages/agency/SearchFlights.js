import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  FiSearch,
  FiCalendar,
  FiX,
  FiLayers,
  FiGlobe,
  FiMapPin,
  FiPackage,
  FiAlertTriangle,
  FiSend,
} from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import AIRLINE_PRESETS from '../../config/airlinePresets';
import { Button, Badge, EmptyState, Skeleton, cn } from '../../components/ui';

// Helper to get airline preset by name
const getAirlinePreset = (airlineName) => {
  return AIRLINE_PRESETS.find(a => a.name.toLowerCase() === (airlineName || '').toLowerCase());
};

const ease = [0.16, 1, 0.3, 1];

const SearchFlights = () => {
  const reduce = useReducedMotion();

  // Helper to get airline logo by name
  const getAirlineLogo = (airlineName) => {
    const preset = getAirlinePreset(airlineName);
    return preset ? preset.logo : null;
  };

  // Helper to get airline route info
  const getAirlineRoute = (flight) => {
    const departure = flight.departureCity || 'N/A';
    const destination = flight.destinationCity || 'N/A';
    return `${departure} - ${destination}`;
  };

  const [searchParams] = useSearchParams();
  const initialGroup = searchParams.get('group') || 'ALL';
  const [selectedGroup, setSelectedGroup] = useState(initialGroup);
  const [dateFilter, setDateFilter] = useState('');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  // Group flights by airline and sort alphabetically
  const flightsByAirline = useMemo(() => {
    const grouped = {};
    flights.forEach(flight => {
      const airlineName = flight.airlineName || 'Unknown Airline';
      if (!grouped[airlineName]) {
        grouped[airlineName] = [];
      }
      grouped[airlineName].push(flight);
    });

    // Sort airlines alphabetically
    const sortedAirlines = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    // Sort flights within each airline by date
    sortedAirlines.forEach(airline => {
      grouped[airline].sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate));
    });

    return { grouped, sortedAirlines };
  }, [flights]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await apiClient.get('/api/groups');
        const groupList = Array.isArray(response.data) ? response.data : [];
        console.log('Fetched groups:', groupList); // Debug log
        setGroups(groupList);
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const loadFlights = async () => {
      setLoading(true);
      setError('');
      try {
        const params = [];
        if (selectedGroup !== 'ALL') params.push(`group=${selectedGroup}`);
        if (dateFilter) params.push(`departureDate=${dateFilter}`);
        const queryString = params.length > 0 ? `?${params.join('&')}` : '';
        const response = await apiClient.get(`/api/admin/flights/search${queryString}`);
        setFlights(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Error loading flights';
        setError(errorMessage);
        console.error('Error loading flights:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFlights();
  }, [selectedGroup, dateFilter]);

  const handleBook = (flightId) => {
    navigate(`/agency/book/${flightId}`);
  };

  /* Motion presets — mirrors the redesigned LandingPage */
  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.5, ease } },
  };
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
  };

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary-200 bg-gradient-chip text-primary-700 shadow-inner-soft">
            <FiSearch size={20} />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-ink sm:text-2xl">Search &amp; Book Flights</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Browse live inventory across every partner airline and hold a seat in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card"
      >
        <div className="flex flex-col gap-4 border-b border-neutral-200/80 bg-gradient-header px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <FiLayers className="text-primary" size={16} />
            Select Flight Group
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="date-filter" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-600">
              <FiCalendar className="text-primary" size={14} /> Date
            </label>
            <input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="field !w-auto"
            />
            <AnimatePresence>
              {dateFilter && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setDateFilter('')}
                  className="inline-flex items-center gap-1 rounded-sm border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-red-100"
                >
                  <FiX size={13} /> Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-5 py-4">
          <button
            onClick={() => setSelectedGroup('ALL')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-premium',
              selectedGroup === 'ALL'
                ? 'border-primary-700/40 bg-gradient-brand text-white shadow-card'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700'
            )}
          >
            <FiGlobe size={14} /> All Flights
          </button>
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.name)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ease-premium',
                selectedGroup === group.name
                  ? 'border-primary-700/40 bg-gradient-brand text-white shadow-card'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700'
              )}
            >
              {group.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
              <div className="flex items-center gap-4 border-b border-neutral-200/80 bg-gradient-header px-5 py-4">
                <Skeleton className="h-11 w-28 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <div className="space-y-2 p-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          <FiAlertTriangle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && flights.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-card">
          <EmptyState
            icon={<FiSend size={22} />}
            title="No flights found"
            message="Try a different flight group or clear the date filter to see more results."
          />
        </div>
      )}

      {/* ── Results ── */}
      {!loading && !error && flights.length > 0 && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          {flightsByAirline.sortedAirlines.map(airlineName => {
            const airlineFlights = flightsByAirline.grouped[airlineName];
            const airlineLogo = getAirlineLogo(airlineName);
            const firstFlight = airlineFlights[0];
            const route = getAirlineRoute(firstFlight);

            return (
              <motion.div
                key={airlineName}
                variants={fadeUp}
                className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-premium"
              >
                {/* Airline header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/80 bg-gradient-header px-5 py-4">
                  <div className="flex min-w-0 items-center gap-4">
                    {airlineLogo ? (
                      <img
                        src={airlineLogo}
                        alt={airlineName}
                        className="h-11 w-28 shrink-0 rounded-lg border border-neutral-200 bg-white object-contain p-1.5"
                      />
                    ) : (
                      <div className="flex h-11 w-28 shrink-0 items-center justify-center rounded-lg border border-primary-200 bg-gradient-chip text-primary-700">
                        <FiSend size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-ink">{airlineName}</h2>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-neutral-500">
                        <FiMapPin size={12} className="shrink-0 text-primary" /> {route}
                      </p>
                    </div>
                  </div>
                  <Badge tone="primary" dot={false} className="shrink-0">
                    {airlineFlights.length} {airlineFlights.length === 1 ? 'Flight' : 'Flights'}
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
                      {airlineFlights.map(flight => {
                        const hasMeal = flight.meal === 'Yes' || flight.meal === 'yes';
                        const full = flight.seatsRemaining === 0;
                        const seatsLow = !full && flight.seatsRemaining < 10;
                        return (
                          <tr
                            key={flight.id}
                            className={cn(
                              'border-b border-neutral-100 transition-colors duration-150 ease-premium last:border-0 hover:bg-primary-50/60',
                              seatsLow && 'bg-amber-50/40'
                            )}
                          >
                            <td className="whitespace-nowrap px-5 py-3.5 font-medium text-neutral-800">
                              {new Date(flight.departureDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-neutral-600">
                              <span className="font-semibold text-primary-700">{flight.departureTime}</span>
                              <span className="mx-1 text-neutral-400">–</span>
                              {flight.arrivalTime}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-neutral-600">
                              <span className="inline-flex items-center gap-1.5">
                                <FiPackage size={13} className="text-neutral-400" />
                                {flight.baggage || '20+7 KG'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <Badge tone={hasMeal ? 'success' : 'neutral'}>{hasMeal ? 'Yes' : 'No'}</Badge>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span
                                className={cn(
                                  'font-semibold',
                                  full ? 'text-neutral-400' : seatsLow ? 'text-danger' : 'text-success'
                                )}
                              >
                                {flight.seatsRemaining}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold text-ink">
                              {parseInt(flight.pricePerSeat).toLocaleString()} PKR
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-right">
                              <Button size="sm" disabled={full} onClick={() => handleBook(flight.id)}>
                                {full ? 'Full' : 'Book Now'}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 p-4 sm:hidden">
                  {airlineFlights.map(flight => {
                    const hasMeal = flight.meal === 'Yes' || flight.meal === 'yes';
                    const full = flight.seatsRemaining === 0;
                    const seatsLow = !full && flight.seatsRemaining < 10;
                    return (
                      <div key={flight.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-card">
                        <div className="flex items-center justify-between bg-neutral-50 px-4 py-2.5">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                            <FiCalendar size={12} className="text-primary" />
                            {new Date(flight.departureDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="font-mono text-xs font-semibold text-neutral-500">{flight.flightNumber}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 px-4 py-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Time</p>
                            <p className="mt-0.5 text-sm font-medium text-neutral-800">
                              {flight.departureTime} – {flight.arrivalTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Baggage</p>
                            <p className="mt-0.5 text-sm font-medium text-neutral-800">{flight.baggage || '20+7 KG'}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Meal</p>
                            <div className="mt-1">
                              <Badge tone={hasMeal ? 'success' : 'neutral'}>{hasMeal ? 'Yes' : 'No'}</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Seats</p>
                            <p
                              className={cn(
                                'mt-0.5 text-sm font-semibold',
                                full ? 'text-neutral-400' : seatsLow ? 'text-danger' : 'text-success'
                              )}
                            >
                              {flight.seatsRemaining}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/60 px-4 py-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Fare</p>
                            <p className="text-base font-bold text-ink">
                              {parseInt(flight.pricePerSeat).toLocaleString()} PKR
                            </p>
                          </div>
                          <Button size="sm" disabled={full} onClick={() => handleBook(flight.id)}>
                            {full ? 'Full' : 'Book Now'}
                          </Button>
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
