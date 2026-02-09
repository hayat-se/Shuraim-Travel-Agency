import React, { useState, useEffect } from 'react';
import UpdateBooking from './UpdateBooking';
import apiClient from '../../config/axiosConfig';
import '../../styles/MyBookings.css';

import React, { useState, useEffect } from "react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div>
      <h2>My Bookings</h2>
      {loading ? <p>Loading...</p> : <p>No bookings yet</p>}
    </div>
  );
}

export default MyBookings;
    fetchBookings();
