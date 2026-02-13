import React, { useState, useEffect } from 'react';
import AIRLINE_PRESETS from '../../config/airlinePresets';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import '../../styles/Search.css';

const SearchFlights = () => {
    // Helper to get airline logo by name
    const getAirlineLogo = (airlineName) => {
      const preset = AIRLINE_PRESETS.find(a => a.name.toLowerCase() === (airlineName || '').toLowerCase());
      return preset ? preset.logo : null;
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

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await apiClient.get('/api/groups');
        setGroups(Array.isArray(response.data) ? response.data : []);
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
      {/* Show selected group name as heading */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ color: '#1a2330', fontWeight: 600, fontSize: 22 }}>
          {selectedGroup === 'ALL' ? 'All Flight Groups' : `Group: ${selectedGroup}`}
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 24 }}>
        <h1 style={{ marginBottom: 0 }}>Search & Book Flights</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ marginRight: 4 }}><i className="fa-solid fa-calendar-days"></i> Filter by Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
          />
          {dateFilter && (
            <button
              className="clear-date-btn"
              onClick={() => setDateFilter('')}
              style={{ marginLeft: 4 }}
            >
              <i className="fa-solid fa-xmark"></i> Clear
            </button>
          )}
        </div>
      </div>

      {/* Airline Group Buttons */}
      <div className="group-filter" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <h3 style={{ marginBottom: 0, marginRight: 16 }}>Select Flight Group</h3>
          <div className="group-buttons" style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
            <button
              className={`group-btn ${selectedGroup === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedGroup('ALL')}
            >
              All Flights
            </button>
            {groups.map(group => (
              <button
                key={group.id}
                className={`group-btn ${selectedGroup === group.groupName ? 'active' : ''}`}
                onClick={() => setSelectedGroup(group.groupName)}
              >
                {group.groupName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="loading">Loading flights...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && flights.length === 0 && (
        <div className="no-flights">No flights found for the selected criteria.</div>
      )}

      {!loading && !error && flights.length > 0 && (
        <div className="flights-display">
          {/* Desktop Table View */}
          <div className="desktop-table">
            <table className="ft-table" style={{ width: '100%', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px #eee' }}>
              <thead>
                <tr style={{ background: '#1a2330', color: '#fff' }}>
                  <th>FLIGHT</th>
                  <th>AIRLINE</th>
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
                {flights.map(flight => (
                  <tr key={flight.id} className={flight.seatsRemaining < 5 ? 'low-availability' : ''} style={{ background: '#fcf8f5' }}>
                    <td className="ft-flight">
                      <span className="ft-flight-number">{flight.flightNumber}</span>
                    </td>
                    <td className="ft-airline">
                      {getAirlineLogo(flight.airlineName) ? (
                        <img src={getAirlineLogo(flight.airlineName)} alt={flight.airlineName} style={{ height: 32, marginRight: 8, verticalAlign: 'middle', borderRadius: 4 }} />
                      ) : null}
                      <span>{flight.airlineName || flight.airline || 'N/A'}</span>
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
                      <span className={`ft-class-tag ${flight.flightClass}`}>{flight.flightClass === 'economy' ? 'ECO' : 'BIZ'}</span>
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
                      <span className={flight.seatsRemaining < 10 ? 'ft-seats-low' : 'ft-seats-ok'}>{flight.seatsRemaining}</span>
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
            {flights.map(flight => (
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
                      <span className="ft-card-label">AIRLINE</span>
                      <span className="ft-card-value">{flight.airlineName || flight.airline || 'N/A'}</span>
                    </div>
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
      )}
    </div>
  );
};

export default SearchFlights;