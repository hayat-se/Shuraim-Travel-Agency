
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
                  <td style={{fontWeight:600}}>{booking.reference || booking._id.slice(-6).toUpperCase()}</td>
                  <td>
                    <span className={`status-badge status-${booking.status?.toLowerCase()}`}>{booking.status}</span>
                  </td>
                  <td>{booking.flight?.flightNumber || <span style={{color:'#bbb'}}>N/A</span>}</td>
                  <td>{booking.flight?.departureDate ? new Date(booking.flight.departureDate).toLocaleDateString() : <span style={{color:'#bbb'}}>N/A</span>}</td>
                  <td>{booking.passengers?.length || 0}</td>
                  <td>{typeof booking.totalPrice === 'number' ? booking.totalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : <span style={{color:'#bbb'}}>N/A</span>}</td>
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
