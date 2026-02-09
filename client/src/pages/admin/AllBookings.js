import React, { useState, useEffect } from "react";

function AllBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings([]);
  }, []);

  return (
    <div>
      <h2>All Bookings</h2>
    </div>
  );
}

export default AllBookings;
