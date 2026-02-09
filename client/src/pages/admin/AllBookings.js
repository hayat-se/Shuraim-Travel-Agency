import React, { useState, useEffect } from 'react';
import React, { useEffect, useState } from "react";

function AllBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // TEMP SAFE FIX so build passes
    // Replace later with real API call
    setBookings([]);
  }, []);

  return (
    <div>
      <h2>All Bookings</h2>
    </div>
  );
}

export default AllBookings;
