
import React, { useState, useEffect } from "react";
import apiClient from '../../config/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';

function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.GET_ALL_BOOKINGS);
      setBookings(res.data);
    } catch (err) {
      setBookings([]);
    }
    setLoading(false);
  };

  const handleConfirm = async (bookingId) => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await apiClient.put(`/api/bookings/${bookingId}/confirm`);
      fetchBookings();
    } catch (err) {}
    setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
  };

  const handleCancel = async (bookingId) => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await apiClient.put(`/api/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {}
    setActionLoading((prev) => ({ ...prev, [bookingId]: false }));
  };

  return (
    <div>
      <h2>All Bookings</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Agency</th>
              <th>Flight</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.bookingId} style={{ background: b.status === 'pending' ? '#fffbe6' : b.status === 'sold' ? '#e6fff2' : 'white' }}>
                <td>{b.bookingId}</td>
                <td>{b.agency?.agencyName || '-'}</td>
                <td>{b.flight?.flightNumber || '-'}</td>
                <td style={{ fontWeight: b.status === 'sold' ? 'bold' : 'normal', color: b.status === 'sold' ? 'green' : 'inherit' }}>{b.status}</td>
                <td>{new Date(b.createdAt).toLocaleString()}</td>
                <td>
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => handleConfirm(b.bookingId)} disabled={actionLoading[b.bookingId]}>Confirm</button>
                      <button onClick={() => handleCancel(b.bookingId)} disabled={actionLoading[b.bookingId]}>Cancel</button>
                    </>
                  )}
                  {b.status === 'sold' && <span>Confirmed & Sold</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllBookings;
