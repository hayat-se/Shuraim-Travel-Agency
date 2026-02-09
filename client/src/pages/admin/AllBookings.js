  const handleConfirm = async (bookingId) => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      try {
        await apiClient.put(`/api/bookings/${bookingId}/confirm`, {});
        alert('Booking confirmed successfully!');
        fetchBookings();
      } catch (error) {
        alert(error.response?.data?.error || 'Error confirming booking');
      }
    }
  };
import React, { useState, useEffect } from 'react';
import apiClient from '../../config/axiosConfig';
import '../../styles/Management.css';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/api/bookings');
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await apiClient.put(`/api/bookings/${bookingId}/cancel`, {});
        alert('Booking cancelled successfully!');
        fetchBookings();
      } catch (error) {
        alert(error.response?.data?.error || 'Error cancelling booking');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="management-container">
      <h1>All Bookings</h1>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Flight</th>
              <th>Agency</th>
              <th>Seats</th>
              <th>Total Price</th>
              <th>Passengers</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td>{booking.bookingId}</td>
                <td>{booking.flight?.flightNumber}</td>
                <td>{booking.agency?.agencyName}</td>
                <td>{booking.seatsBooked}</td>
                <td>PKR {booking.totalPrice.toLocaleString()}</td>
                <td>{booking.passengers.length}</td>
                <td>
                  <span className={`status ${booking.status}`}>{booking.status}</span>
                  {booking.status === 'cancel_requested' && booking.cancellationReason && (
                    <div className="small-note">Reason: {booking.cancellationReason}</div>
                  )}
                </td>
                <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                <td className="actions">
                  {booking.status === 'hold' && (
                    <>
                      <button 
                        className="btn-approve"
                        onClick={() => handleConfirm(booking.bookingId)}
                      >
                        Confirm
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => handleCancel(booking.bookingId)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.status === 'cancel_requested' && (
                    <button 
                      className="btn-approve"
                      onClick={() => handleCancel(booking.bookingId)}
                    >
                      Approve Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllBookings;
