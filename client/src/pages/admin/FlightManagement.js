import React, { useState, useEffect } from 'react';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import '../../styles/Management.css';

const FlightManagement = () => {
  const [flights, setFlights] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const initialFormState = {
    airlineName: '',
    flightNumber: '',
    departureCity: '',
    destinationCity: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    flightClass: 'economy',
    group: 'ALL',
    status: 'active',
    meal: 'No Meal',
    baggage: '20kg',
    totalSeatsAvailable: '',
    pricePerSeat: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [editFlightId, setEditFlightId] = useState(null);
  const [editSeatsBooked, setEditSeatsBooked] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [airlines, setAirlines] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchFlights();
    fetchAirlines();
    fetchGroups();
  }, []);

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
      const response = await apiClient.get('/api/groups/admin');
      setGroups(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchFlights = async () => {
    try {
      const response = await apiClient.get('/api/admin/flights');
      setFlights(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error fetching flights';
      setError(errorMessage);
      console.error('Error fetching flights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        totalSeatsAvailable: Number(formData.totalSeatsAvailable),
        pricePerSeat: Number(formData.pricePerSeat)
      };

      if (isEditing && editFlightId) {
        payload.seatsRemaining = Math.max(0, payload.totalSeatsAvailable - editSeatsBooked);
        await apiClient.put(`/api/admin/flights/${editFlightId}`, payload);
        setSuccess('Flight updated successfully!');
      } else {
        await apiClient.post('/api/admin/flights', payload);
        setSuccess('Flight created successfully!');
      }

      setError('');
      setShowForm(false);
      setIsEditing(false);
      setEditFlightId(null);
      setEditSeatsBooked(0);
      setFormData(initialFormState);
      fetchFlights();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const fallback = isEditing ? 'Error updating flight' : 'Error creating flight';
      const errorMessage = err.response?.data?.error || err.message || fallback;
      setError(errorMessage);
      setSuccess('');
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  const handleEditClick = (flight) => {
    setIsEditing(true);
    setEditFlightId(flight.id);
    setEditSeatsBooked(flight.seatsBooked || 0);
    setShowForm(true);
    setError('');
    setSuccess('');
    setFormData({
      airlineName: flight.airlineName || '',
      flightNumber: flight.flightNumber || '',
      departureCity: flight.departureCity || '',
      destinationCity: flight.destinationCity || '',
      departureDate: formatDate(flight.departureDate),
      departureTime: flight.departureTime || '',
      arrivalDate: formatDate(flight.arrivalDate),
      arrivalTime: flight.arrivalTime || '',
      flightClass: flight.flightClass || 'economy',
      group: flight.group || 'ALL',
      status: flight.status || 'active',
      meal: flight.meal || 'No Meal',
      baggage: flight.baggage || '20kg',
      totalSeatsAvailable: flight.totalSeatsAvailable || '',
      pricePerSeat: flight.pricePerSeat || ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFlightId(null);
    setEditSeatsBooked(0);
    setShowForm(false);
    setFormData(initialFormState);
    setError('');
  };

  const handleDelete = async (flight) => {
    const confirmMsg = `Are you sure you want to permanently delete flight ${flight.flightNumber} (${flight.departureCity} → ${flight.destinationCity})?\n\nThis action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await apiClient.delete(`/api/admin/flights/${flight.id}`);
      setSuccess(`Flight ${flight.flightNumber} deleted successfully!`);
      setError('');
      fetchFlights();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error deleting flight';
      setError(errorMessage);
      setSuccess('');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="management-container">
      <h1>Flight Management</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button
        className="add-btn"
        onClick={() => {
          if (showForm) {
            handleCancelEdit();
          } else {
            setShowForm(true);
            setIsEditing(false);
            setEditFlightId(null);
            setEditSeatsBooked(0);
            setFormData(initialFormState);
          }
        }}
      >
        {showForm ? (isEditing ? '✖ Cancel Edit' : '✖ Cancel') : '➕ Add New Flight'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-row">
            <select
              name="airlineName"
              value={formData.airlineName}
              onChange={handleChange}
              required
            >
              <option value="">Select Airline</option>
              {airlines.map((airline) => (
                <option key={airline.id} value={airline.name}>
                  {airline.name}{airline.code ? ` (${airline.code})` : ''}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="flightNumber"
              placeholder="Flight Number"
              value={formData.flightNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="departureCity"
              placeholder="Departure City"
              value={formData.departureCity}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="destinationCity"
              placeholder="Destination City"
              value={formData.destinationCity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="departureTime"
              value={formData.departureTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="date"
              name="arrivalDate"
              value={formData.arrivalDate}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <select
              name="flightClass"
              value={formData.flightClass}
              onChange={handleChange}
            >
              <option value="economy">Economy</option>
              <option value="business">Business</option>
            </select>
            <select
              name="group"
              value={formData.group}
              onChange={handleChange}
            >
              <option value="ALL">ALL Groups</option>
              {groups.map(group => (
                <option key={group.id} value={group.name}>{group.name} Group</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-row">
            <input
              type="number"
              name="totalSeatsAvailable"
              placeholder="Total Seats"
              value={formData.totalSeatsAvailable}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="pricePerSeat"
              placeholder="Fare Per Seat (PKR)"
              value={formData.pricePerSeat}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="meal"
              placeholder="Meal (e.g., Breakfast, Lunch, No Meal)"
              value={formData.meal}
              onChange={handleChange}
            />
            <input
              type="text"
              name="baggage"
              placeholder="Baggage (e.g., 20kg, 30kg)"
              value={formData.baggage}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            <i className={`fa-solid ${isEditing ? 'fa-save' : 'fa-plane'}`}></i>
            {isEditing ? ' Update Flight' : ' Add Flight'}
          </button>
        </form>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Airline</th>
              <th>Flight Number</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Class</th>
              <th>Total Seats</th>
              <th>Booked</th>
              <th>Remaining</th>
              <th>Price (PKR)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.map(flight => (
              <tr key={flight.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(() => {
                    const airline = airlines.find(a => a.name === flight.airlineName);
                    return airline && airline.logoUrl ? (
                      <img
                        src={`${API_BASE_URL}${airline.logoUrl}`}
                        alt={flight.airlineName}
                        style={{ width: '30px', height: '22px', objectFit: 'contain', borderRadius: '3px' }}
                      />
                    ) : null;
                  })()}
                  <span>{flight.airlineName}</span>
                </td>
                <td>{flight.flightNumber}</td>
                <td>{flight.departureCity} → {flight.destinationCity}</td>
                <td>{new Date(flight.departureDate).toLocaleDateString()}</td>
                <td>{flight.flightClass.toUpperCase()}</td>
                <td>{flight.totalSeatsAvailable}</td>
                <td>{flight.seatsBooked}</td>
                <td>{flight.seatsRemaining}</td>
                <td>{flight.pricePerSeat.toLocaleString()}</td>
                <td><span className={`status ${flight.status}`}>{flight.status}</span></td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => handleEditClick(flight)}>
                    ✎ Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(flight)}>
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightManagement;