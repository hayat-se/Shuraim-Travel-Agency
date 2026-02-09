import React, { useState } from 'react';
import apiClient from '../../config/axiosConfig';

const UpdateBooking = ({ booking, onClose, onUpdated }) => {
  const [passengers, setPassengers] = useState(booking.passengers);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await apiClient.put(`/api/bookings/${booking.bookingId}/update`, { passengers });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Update Booking Details</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          {passengers.map((p, idx) => (
            <div key={idx} className="passenger-card">
              <h4>Passenger {idx + 1}</h4>
              <input type="text" value={p.givenName} onChange={e => handlePassengerChange(idx, 'givenName', e.target.value)} placeholder="Given Name" required />
              <input type="text" value={p.surname} onChange={e => handlePassengerChange(idx, 'surname', e.target.value)} placeholder="Surname" required />
              <input type="text" value={p.passport} onChange={e => handlePassengerChange(idx, 'passport', e.target.value)} placeholder="Passport" required />
              {/* Add more fields as needed */}
            </div>
          ))}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Updating...' : 'Update Booking'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateBooking;
