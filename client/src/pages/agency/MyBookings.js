import React, { useState, useEffect } from "react";
import "../../styles/MyBookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Temporary safe logic
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
