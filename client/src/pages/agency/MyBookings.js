
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
        <div>
          {bookings.map((booking) => (
            <div className="booking-details" key={booking._id}>
              <div className="booking-header">
                <h3>Booking Reference: {booking.reference || booking._id}</h3>
                <span>Status: {booking.status}</span>
              </div>
              <div className="detail-row">
                <span>Flight: {booking.flight?.flightNumber || "N/A"}</span>
                <span>Date: {booking.flight?.departureDate ? new Date(booking.flight.departureDate).toLocaleDateString() : "N/A"}</span>
                <span>Passengers: {booking.passengers?.length || 0}</span>
              </div>
              <div className="detail-row">
                <span>Total Price: {booking.totalPrice ? `₹${booking.totalPrice}` : "N/A"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
