import React, { useState, useEffect } from 'react';
import UpdateBooking from './UpdateBooking';
import apiClient from '../../config/axiosConfig';
import '../../styles/MyBookings.css';

const MyBookings = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateBooking, setUpdateBooking] = useState(null);
  const handleUpdateClick = (booking) => {
    setUpdateBooking(booking);
    setShowUpdateModal(true);
  };

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/api/bookings/my-bookings');
      setBookings(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error fetching bookings';
      setError(errorMessage);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (bookingId) => {
    try {
      setDownloadError('');
      
      const response = await apiClient.get(`/api/tickets/download/${bookingId}`, {
        responseType: 'blob'
      });

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error downloading ticket';
      setDownloadError(errorMessage);
      console.error('Error downloading ticket:', err);
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
    setCancellationReason('');
  };

  // Check if booking is within 1-hour cancel window
  const getCancelTimeLeft = (booking) => {
    const created = new Date(booking.createdAt).getTime();
    const deadline = created + 60 * 60 * 1000; // 1 hour
    const remaining = deadline - Date.now();
    return remaining > 0 ? remaining : 0;
  };

  const formatTimeLeft = (ms) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  // Auto-refresh to update countdown timers
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000); // refresh every 1s
    return () => clearInterval(timer);
  }, []);

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    setCancelling(true);
    try {
      await apiClient.put(
        `/api/bookings/${selectedBooking.bookingId}/cancel`,
        { reason: cancellationReason }
      );

      // Update local state - booking is now directly cancelled
      setBookings(prev =>
        prev.map(b =>
          b.id === selectedBooking.id ? { ...b, status: 'cancelled', cancellationReason: cancellationReason || null } : b
        )
      );

      setShowCancelModal(false);
      setCancellationReason('');
      setSelectedBooking(null);
      alert('Booking cancelled successfully. Seats have been freed.');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error cancelling booking';
      alert('Error: ' + errorMessage);
      console.error('Error cancelling booking:', err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="loading">Loading your bookings...</div>;

  return (
    <div className="bookings-container">
      <h1>My Bookings</h1>

      {error && <div className="error-message">{error}</div>}
      {downloadError && <div className="error-message">{downloadError}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>You haven't made any bookings yet.</p>
          <a href="/agency/search-flights" className="btn"><i className="fa-solid fa-search"></i> Search Flights</a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.flight?.flightNumber || 'Flight'}</h3>
                <span className={`status ${booking.status}`}>{booking.status.toUpperCase()}</span>
              </div>

              <div className="booking-details">
                <div className="detail-row">
                  <span><strong>Booking ID:</strong> {booking.bookingId}</span>
                  <span><strong>Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="detail-row">
                  <span><strong>Route:</strong> {booking.flight?.departureCity} → {booking.flight?.destinationCity}</span>
                  <span><strong>Flight Date:</strong> {new Date(booking.flight?.departureDate).toLocaleDateString()}</span>
                </div>

                <div className="detail-row">
                  <span><strong>Seats Booked:</strong> {booking.seatsBooked}</span>
                  <span><strong>Passengers:</strong> {booking.passengers.length}</span>
                </div>

                <div className="detail-row">
                  <span><strong>Total Price:</strong> PKR {booking.totalPrice.toLocaleString()}</span>
                  <span><strong>Status:</strong> {booking.paymentStatus}</span>
                </div>

                {booking.passengers.length > 0 && (
                  <div className="passengers-list">
                    <strong>Passengers:</strong>
                    <ul>
                      {booking.passengers.map((passenger, idx) => (
                        <li key={idx}>
                          {passenger.title || ''} {passenger.givenName ? `${passenger.givenName} ${passenger.surname || ''}` : passenger.name} — Passport: {passenger.passport || passenger.cnic || '-'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {booking.status === 'cancelled' && booking.cancellationReason && (
                  <div className="cancellation-info">
                    <strong>Cancellation Reason:</strong> {booking.cancellationReason}
                  </div>
                )}
              </div>

              <div className="booking-actions">
                {booking.ticketGenerated && booking.status !== 'cancelled' && (
                  <button 
                    className="btn-download"
                    onClick={() => handleDownloadTicket(booking.bookingId)}
                  >
                    📥 Download E-Ticket
                  </button>
                )}
                {(booking.status === 'hold' || booking.status === 'confirmed') && getCancelTimeLeft(booking) > 0 && (
                  <>
                    <button 
                      className="btn-update"
                      onClick={() => handleUpdateClick(booking)}
                    >
                      <i className="fa-solid fa-pen"></i> Update Details
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => handleCancelClick(booking)}
                    >
                      <i className="fa-solid fa-trash-alt"></i> Cancel ({formatTimeLeft(getCancelTimeLeft(booking))} left)
                    </button>
                  </>
                )}
                    {/* Update Modal */}
                    {showUpdateModal && updateBooking && (
                      <UpdateBooking 
                        booking={updateBooking} 
                        onClose={() => setShowUpdateModal(false)} 
                        onUpdated={fetchBookings}
                      />
                    )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Cancel Booking</h2>
            <p>Are you sure you want to cancel booking <strong>{selectedBooking?.bookingId}</strong>?</p>
            
            <div className="modal-form">
              <label htmlFor="reason">
                Cancellation Reason <span className="optional">(Optional)</span>
              </label>
              <textarea
                id="reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please tell us why you're cancelling this booking..."
                rows="4"
                disabled={cancelling}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel-modal"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Back
              </button>
              <button 
                className="btn-confirm-cancel"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
