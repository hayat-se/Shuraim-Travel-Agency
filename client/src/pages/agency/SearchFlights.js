import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import AIRLINE_PRESETS from '../../config/airlinePresets';
import '../../styles/Search.css';

// Helper to get airline preset by name
const getAirlinePreset = (airlineName) => {
  return AIRLINE_PRESETS.find(a => a.name.toLowerCase() === (airlineName || '').toLowerCase());
};

const SearchFlights = () => {
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

  return (
    <div className="search-container">
      <div className="search-header">
        <h1><i className="fa-solid fa-magnifying-glass"></i> Search & Book Flights</h1>
        <div className="header-actions">
          <label className="date-filter-label">
            <i className="fa-solid fa-calendar-days"></i> Filter by Date:
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-input"
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
      </div>

      {/* Airline Group Buttons */}
      <div className="group-filter">
        <h3><i className="fa-solid fa-layer-group"></i> Select Flight Group</h3>
        <div className="group-buttons">
          <button
            className={`group-btn ${selectedGroup === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedGroup('ALL')}
          >
            <i className="fa-solid fa-globe"></i> All Flights
          </button>
          {groups.map(group => (
            <button
              key={group.id}
              className={`group-btn ${selectedGroup === group.name ? 'active' : ''}`}
              onClick={() => setSelectedGroup(group.name)}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="loading">
          <i className="fa-solid fa-spinner fa-spin"></i> Loading flights...
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <i className="fa-solid fa-triangle-exclamation"></i> {error}
        </div>
      )}

      {!loading && !error && flights.length === 0 && (
        <div className="no-flights">
          <i className="fa-solid fa-plane-slash"></i>
          <p>No flights found for the selected criteria.</p>
        </div>
      )}

      {!loading && !error && flights.length > 0 && (
        <div className="flights-display">
          {flightsByAirline.sortedAirlines.map(airlineName => {
            const airlineFlights = flightsByAirline.grouped[airlineName];
            const airlineLogo = getAirlineLogo(airlineName);
            const firstFlight = airlineFlights[0];
            const route = getAirlineRoute(firstFlight);

            return (
              <div key={airlineName} className="airline-section">
                {/* Airline Header with Logo and Route */}
                <div className="airline-header">
                  <div className="airline-info">
                    {airlineLogo ? (
                      <img 
                        src={airlineLogo} 
                        alt={airlineName} 
                        className="airline-logo-header"
                      />
                    ) : (
                      <div className="airline-logo-placeholder">
                        <i className="fa-solid fa-plane"></i>
                      </div>
                    )}
                    <div className="airline-details">
                      <h2 className="airline-name">{airlineName}</h2>
                      <p className="airline-route">
                        <i className="fa-solid fa-route"></i> {route}
                      </p>
                    </div>
                  </div>
                  <div className="airline-count">
                    <span className="flight-count-badge">
                      {airlineFlights.length} {airlineFlights.length === 1 ? 'Flight' : 'Flights'}
                    </span>
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="airline-table-wrapper desktop-view">
                  <table className="airline-flights-table">
                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>TIME</th>
                        <th>BAG</th>
                        <th>MEAL</th>
                        <th>FARE</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {airlineFlights.map(flight => (
                        <tr key={flight.id}>
                          <td className="date-cell">
                            {new Date(flight.departureDate).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            })}
                          </td>
                          <td className="time-cell">
                            {flight.departureTime} - {flight.arrivalTime}
                          </td>
                          <td className="baggage-cell">
                            {flight.baggage || '20+7 KG'}
                          </td>
                          <td className="meal-cell">
                            <span className={`meal-badge ${(flight.meal === 'Yes' || flight.meal === 'yes') ? 'meal-yes' : 'meal-no'}`}>
                              {(flight.meal === 'Yes' || flight.meal === 'yes') ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td className="fare-cell">
                            {parseInt(flight.pricePerSeat).toLocaleString()} PKR/-
                          </td>
                          <td className="action-cell">
                            <button 
                              className="book-now-btn"
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
                <div className="mobile-view">
                  {airlineFlights.map(flight => (
                    <div key={flight.id} className="flight-mobile-card">
                      <div className="mobile-card-header">
                        <span className="mobile-date">
                          <i className="fa-solid fa-calendar"></i>{' '}
                          {new Date(flight.departureDate).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="mobile-flight-number">
                          {flight.flightNumber}
                        </span>
                      </div>
                      
                      <div className="mobile-card-body">
                        <div className="mobile-info-row">
                          <div className="mobile-info-item">
                            <span className="mobile-label">
                              <i className="fa-solid fa-clock"></i> Time
                            </span>
                            <span className="mobile-value">
                              {flight.departureTime} - {flight.arrivalTime}
                            </span>
                          </div>
                          <div className="mobile-info-item">
                            <span className="mobile-label">
                              <i className="fa-solid fa-suitcase"></i> Baggage
                            </span>
                            <span className="mobile-value">
                              {flight.baggage || '20+7 KG'}
                            </span>
                          </div>
                        </div>

                        <div className="mobile-info-row">
                          <div className="mobile-info-item">
                            <span className="mobile-label">
                              <i className="fa-solid fa-utensils"></i> Meal
                            </span>
                            <span className={`mobile-value meal-badge-mobile ${(flight.meal === 'Yes' || flight.meal === 'yes') ? 'meal-yes' : 'meal-no'}`}>
                              {(flight.meal === 'Yes' || flight.meal === 'yes') ? 'YES' : 'NO'}
                            </span>
                          </div>
                          <div className="mobile-info-item">
                            <span className="mobile-label">
                              <i className="fa-solid fa-chair"></i> Seats
                            </span>
                            <span className={`mobile-value ${flight.seatsRemaining < 10 ? 'seats-low' : ''}`}>
                              {flight.seatsRemaining}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mobile-card-footer">
                        <div className="mobile-fare">
                          <span className="fare-label">Fare</span>
                          <span className="fare-amount">
                            {parseInt(flight.pricePerSeat).toLocaleString()} PKR/-
                          </span>
                        </div>
                        <button 
                          className="book-now-btn-mobile"
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
      )}
    </div>
  );
};

export default SearchFlights;