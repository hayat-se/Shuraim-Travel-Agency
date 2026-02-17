

import React, { useState, useEffect } from "react";
import apiClient from "../../config/axiosConfig";
import { API_ENDPOINTS } from "../../config/api";
import "../../styles/MyBookings.css";

function MyBookings() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.GET_MY_BOOKINGS);
        setBookings(response.data || []);
      } catch (err) {
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="bookings-container">
      <h2>My Bookings</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && bookings.length === 0 && !error && <p>No bookings yet</p>}
      {!loading && bookings.length > 0 && (
        <div className="booking-cards-list">
          {bookings.map((booking) => (
            <div className="booking-card" key={booking._id}>
              <div className="booking-card-header">
                <div className="booking-ref">
                  <span className="booking-label">Reference:</span> <strong>{booking.reference ? booking.reference : (booking._id && typeof booking._id === 'string' && booking._id.length >= 6 ? booking._id.slice(-6).toUpperCase() : 'N/A')}</strong>
                </div>
                <span className={`status-badge status-${booking.status?.toLowerCase()}`}>{booking.status}</span>
              </div>
              <div className="booking-card-main">
                <div className="flight-info">
                  <div><span className="booking-label">Flight:</span> <strong>{booking.flight?.flightNumber || <span style={{color:'#bbb'}}>N/A</span>}</strong></div>
                  <div><span className="booking-label">Date:</span> <strong>{booking.flight?.departureDate ? new Date(booking.flight.departureDate).toLocaleDateString() : <span style={{color:'#bbb'}}>N/A</span>}</strong></div>
                </div>
                <div className="passenger-info">
                  <span className="booking-label">Passengers:</span> <strong>{booking.passengers?.length || 0}</strong>
                </div>
                <div className="price-info">
                  <span className="booking-label">Total Price:</span> <strong>{typeof booking.totalPrice === 'number' ? booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : <span style={{color:'#bbb'}}>N/A</span>}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
