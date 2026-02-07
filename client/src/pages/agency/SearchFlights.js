import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import '../../styles/Search.css';

const SearchFlights = () => {
  const [searchParams] = useSearchParams();
  const initialGroup = searchParams.get('group') || 'ALL';
  const [selectedGroup, setSelectedGroup] = useState(initialGroup);
  const [filters, setFilters] = useState({
    departureCity: '',
    destinationCity: '',
    departureDate: '',
    flightClass: '',
    minPrice: '',
    maxPrice: ''
  });
  const [dateFilter, setDateFilter] = useState('');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [airlines, setAirlines] = useState([]);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const response = await apiClient.get('/api/airlines/active');
        setAirlines(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching airlines:', err);
      }
    };
    const fetchGroups = async () => {
      try {
        const response = await apiClient.get('/api/groups');
        setGroups(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };
    fetchAirlines();
    fetchGroups();
  }, []);

  useEffect(() => {
    const groupFromUrl = searchParams.get('group') || 'ALL';
    setSelectedGroup(groupFromUrl);
  }, [searchParams]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const queryString = Object.entries(filters)
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const groupParam = selectedGroup !== 'ALL' ? `&group=${selectedGroup}` : '';
      const response = await apiClient.get(`/api/admin/flights/search?${queryString}${groupParam}`);
      setFlights(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error searching flights';
      setError(errorMessage);
      console.error('Error searching flights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (flightId) => {
    navigate(`/agency/book/${flightId}`);
  };

  return (
    <div className="search-container">
      <h1>Search & Book Flights</h1>

      <div className="group-filter">
        <h3>Select Flight Group</h3>
        <div className="group-buttons">
          <button
            className={`group-btn ${selectedGroup === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedGroup('ALL')}
          >
            All Flights
          </button>
          {groups.map(group => (
            <button
              key={group.id}
              className={`group-btn ${selectedGroup === group.name ? 'active' : ''}`}
              onClick={() => setSelectedGroup(group.name)}
            >
              {group.name} Group
            </button>
          ))}
        </div>
      </div>

      <div className="date-filter-bar">
        <div className="date-filter-inner">
          <label><i className="fa-solid fa-calendar-days"></i> Filter by Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button
              className="clear-date-btn"
              onClick={() => setDateFilter('')}
            >
              <i className="fa-solid fa-xmark"></i> Clear
            </button>
          )}
        </div>
        {dateFilter && (
          <span className="date-filter-info">
            Showing flights for: <strong>{new Date(dateFilter + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</strong>
          </span>
        )}
      </div>

      <details className="search-filters">
        <summary><i className="fa-solid fa-filter"></i> Advanced Search Filters</summary>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-row">
            <input
              type="text"
              name="departureCity"
              placeholder="From City"
              value={filters.departureCity}
              onChange={handleChange}
            />
            <input
              type="text"
              name="destinationCity"
              placeholder="To City"
              value={filters.destinationCity}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <input
              type="date"
              name="departureDate"
              value={filters.departureDate}
              onChange={handleChange}
            />
            <select
              name="flightClass"
              value={filters.flightClass}
              onChange={handleChange}
            >
              <option value="">All Classes</option>
              <option value="economy">Economy</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div className="form-row">
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price (PKR)"
              value={filters.minPrice}
              onChange={handleChange}
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price (PKR)"
              value={filters.maxPrice}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="search-btn"><i className="fa-solid fa-search"></i> Apply Filters</button>
        </form>
      </details>

      {error && <div className="error-message">{error}</div>}

      <div className="results-container">
        <h2>Available Flights {selectedGroup !== 'ALL' && `- ${selectedGroup} Group`}</h2>
        {loading ? (
          <div className="loading">Loading flights...</div>
        ) : flights.length === 0 ? (
          <p className="no-results">No flights available</p>
        ) : (
          (() => {
            // Group flights by airline and sort airlines alphabetically
            const grouped = flights.reduce((acc, flight) => {
              const name = flight.airlineName || 'Unknown Airline';
              if (!acc[name]) acc[name] = [];
              acc[name].push(flight);
              return acc;
            }, {});

            const sortedAirlines = Object.keys(grouped).sort((a, b) =>
              a.localeCompare(b, undefined, { sensitivity: 'base' })
            );

            return sortedAirlines.map(airlineName => {
              const airlineData = airlines.find(a => a.name === airlineName);
              const airlineFlights = grouped[airlineName];

              // Sub-group by route within each airline
              const routeGroups = airlineFlights.reduce((acc, flight) => {
                const routeKey = `${flight.departureCity}-${flight.destinationCity}`;
                if (!acc[routeKey]) acc[routeKey] = [];
                acc[routeKey].push(flight);
                return acc;
              }, {});

              const sortedRoutes = Object.keys(routeGroups).sort();

              return (
                <div key={airlineName} className="airline-section">
                  {sortedRoutes.map(routeKey => {
                    const routeFlights = routeGroups[routeKey];

                    return (
                      <div key={routeKey} className="route-group">
                        <div className="route-group-header">
                          {airlineData && airlineData.logoUrl ? (
                            <img
                              src={`${API_BASE_URL}${airlineData.logoUrl}`}
                              alt={airlineName}
                              className="airline-section-logo"
                            />
                          ) : (
                            <div className="airline-section-logo-placeholder">
                              <i className="fa-solid fa-plane"></i>
                            </div>
                          )}
                          <span className="route-group-route">{routeKey}</span>
                        </div>

                        {/* Desktop Table View */}
                        <div className="table-wrapper desktop-table">
                          <table className="flights-table">
                            <thead>
                              <tr>
                                <th>FLIGHT</th>
                                <th>DATE</th>
                                <th>TIME</th>
                                <th>CLASS</th>
                                <th>BAG</th>
                                <th>MEAL</th>
                                <th>SEATS</th>
                                <th>FARE (PKR)</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {routeFlights.map(flight => (
                                <tr key={flight.id} className={flight.seatsRemaining < 5 ? 'low-availability' : ''}>
                                  <td className="ft-flight">
                                    <span className="ft-flight-number">{flight.flightNumber}</span>
                                  </td>
                                  <td className="ft-date">
                                    {new Date(flight.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </td>
                                  <td className="ft-time">
                                    <span className="ft-dep-time">{flight.departureTime}</span>
                                    <span className="ft-time-sep">-</span>
                                    <span className="ft-arr-time">{flight.arrivalTime}</span>
                                  </td>
                                  <td className="ft-class">
                                    <span className={`ft-class-tag ${flight.flightClass}`}>
                                      {flight.flightClass === 'economy' ? 'ECO' : 'BIZ'}
                                    </span>
                                  </td>
                                  <td className="ft-bag">{flight.baggage || '20kg'}</td>
                                  <td className="ft-meal">
                                    {flight.meal === 'Yes' || flight.meal === 'yes' ? (
                                      <span className="ft-meal-yes"><i className="fa-solid fa-check"></i></span>
                                    ) : (
                                      <span className="ft-meal-no"><i className="fa-solid fa-xmark"></i></span>
                                    )}
                                  </td>
                                  <td className="ft-seats">
                                    <span className={flight.seatsRemaining < 10 ? 'ft-seats-low' : 'ft-seats-ok'}>
                                      {flight.seatsRemaining}
                                    </span>
                                  </td>
                                  <td className="ft-fare">{flight.pricePerSeat.toLocaleString()}</td>
                                  <td className="ft-action">
                                    <button 
                                      className="ft-book-btn"
                                      onClick={() => handleBook(flight.id)}
                                      disabled={flight.seatsRemaining === 0}
                                    >
                                      {flight.seatsRemaining === 0 ? 'Full' : 'Book Now'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="mobile-cards">
                          {routeFlights.map(flight => (
                            <div key={flight.id} className="ft-card">
                              <div className="ft-card-top">
                                <span className="ft-card-flightno">{flight.flightNumber}</span>
                                <span className="ft-card-date-badge">
                                  {new Date(flight.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </span>
                              </div>

                              <div className="ft-card-details">
                                <div className="ft-card-row">
                                  <div className="ft-card-item">
                                    <span className="ft-card-label">TIME</span>
                                    <span className="ft-card-value">{flight.departureTime} - {flight.arrivalTime}</span>
                                  </div>
                                  <div className="ft-card-item">
                                    <span className="ft-card-label">CLASS</span>
                                    <span className="ft-card-value">{flight.flightClass === 'economy' ? 'Economy' : 'Business'}</span>
                                  </div>
                                  <div className="ft-card-item">
                                    <span className="ft-card-label">SEATS</span>
                                    <span className={`ft-card-value ${flight.seatsRemaining < 10 ? 'ft-seats-low' : ''}`}>{flight.seatsRemaining}</span>
                                  </div>
                                </div>
                                <div className="ft-card-row">
                                  <div className="ft-card-item">
                                    <span className="ft-card-label">BAG</span>
                                    <span className="ft-card-value">{flight.baggage || '20kg'}</span>
                                  </div>
                                  <div className="ft-card-item">
                                    <span className="ft-card-label">MEAL</span>
                                    <span className="ft-card-value">{flight.meal === 'Yes' || flight.meal === 'yes' ? '✓ Yes' : '✗ No'}</span>
                                  </div>
                                  <div className="ft-card-item"></div>
                                </div>
                              </div>

                              <div className="ft-card-bottom">
                                <div className="ft-card-price">
                                  <span className="ft-card-price-label">FARE</span>
                                  <span className="ft-card-price-value">PKR {flight.pricePerSeat.toLocaleString()}</span>
                                </div>
                                <button
                                  className="ft-book-btn"
                                  onClick={() => handleBook(flight.id)}
                                  disabled={flight.seatsRemaining === 0}
                                >
                                  {flight.seatsRemaining === 0 ? 'Full' : 'Book Now'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            });
          })()
        )}
      </div>
    </div>
  );
};

export default SearchFlights;
