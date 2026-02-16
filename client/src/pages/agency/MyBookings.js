
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
        <div className="table-responsive">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Status</th>
                <th>Flight</th>
                <th>Date</th>
                <th>Passengers</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.reference || booking._id}</td>
                  <td>{booking.status}</td>
                  <td>{booking.flight?.flightNumber || "N/A"}</td>
                  <td>{booking.flight?.departureDate ? new Date(booking.flight.departureDate).toLocaleDateString() : "N/A"}</td>
                  <td>{booking.passengers?.length || 0}</td>
                  <td>{booking.totalPrice ? `₹${booking.totalPrice}` : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
