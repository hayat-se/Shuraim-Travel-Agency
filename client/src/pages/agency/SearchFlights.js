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
        const groupParam = selectedGroup !== 'ALL' ? `?group=${selectedGroup}` : '';
        const response = await apiClient.get(`/api/admin/flights/search${groupParam}`);
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
  }, [selectedGroup]);

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

              return (
                <div key={airlineName} className="airline-section">
                  <div className="airline-section-header">
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
                    <div className="airline-section-title">
                      <h3>{airlineName}</h3>
                      <span className="airline-flight-count">
                        {airlineFlights.length} flight{airlineFlights.length !== 1 ? 's' : ''} available
                      </span>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    <table className="flights-table">
                      <thead>
                        <tr>
                          <th>Flight #</th>
                          <th>Route</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Class</th>
                          <th>Meal</th>
                          <th>Baggage</th>
                          <th>Seats</th>
                          <th>Fare</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {airlineFlights.map(flight => (
                          <tr key={flight.id}>
                            <td>
                              <span className="flight-number-cell">{flight.flightNumber}</span>
                            </td>
                            <td>
                              <div className="route">
                                <span>{flight.departureCity}</span>
                                <span className="arrow">→</span>
                                <span>{flight.destinationCity}</span>
                              </div>
                            </td>
                            <td>
                              <div className="date-info">
                                {new Date(flight.departureDate).toLocaleDateString()}
                              </div>
                            </td>
                            <td>
                              <div className="time-range">
                                {flight.departureTime} - {flight.arrivalTime}
                              </div>
                            </td>
                            <td>
                              <span className={`class-badge ${flight.flightClass}`}>
                                {flight.flightClass.toUpperCase()}
                              </span>
                            </td>
                            <td className="meal-info">{flight.meal || 'No Meal'}</td>
                            <td className="baggage-info">{flight.baggage || '20kg'}</td>
                            <td className="seats">
                              <span className={flight.seatsRemaining < 10 ? 'low-seats' : ''}>
                                {flight.seatsRemaining}
                              </span>
                            </td>
                            <td className="price">PKR {flight.pricePerSeat.toLocaleString()}</td>
                            <td>
                              <button 
                                className="book-btn-table"
                                onClick={() => handleBook(flight.id)}
                                disabled={flight.seatsRemaining === 0}
                              >
                                {flight.seatsRemaining === 0 ? 'Full' : 'Book'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
