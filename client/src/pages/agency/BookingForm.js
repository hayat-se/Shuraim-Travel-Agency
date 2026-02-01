import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../config/axiosConfig';
import '../../styles/Booking.css';

const BookingForm = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFlight();
  }, [flightId]);

  const fetchFlight = async () => {
    try {
      const response = await apiClient.get(`/api/admin/flights/${flightId}`);
      setFlight(response.data);
      setPassengers(Array(1).fill({
        name: '',
        cnic: '',
        passport: '',
        phone: '',
        email: ''
      }));
    } catch (error) {
      console.error('Error fetching flight:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatsChange = (e) => {
    const seats = parseInt(e.target.value);
    setSeatsToBook(seats);
    setPassengers(Array(seats).fill({
      name: '',
      cnic: '',
      passport: '',
      phone: '',
      email: ''
    }));
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    setPassengers(updatedPassengers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all passengers
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name || !passengers[i].cnic) {
        alert(`Please fill in Name and CNIC for Passenger ${i + 1}`);
        return;
      }
    }

    setSubmitting(true);

    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const isAgency = token && user;

      if (isAgency) {
        // Agency booking with authentication
        const response = await apiClient.post('/api/bookings', {
          flightId,
          seatsBooked: seatsToBook,
          passengers
        });
        alert('Booking confirmed! Check your email for the e-ticket.');
      } else {
        // Guest booking without authentication
        const response = await apiClient.post('/api/bookings/guest', {
          flightId,
          seatsBooked: seatsToBook,
          passengers
        });
        alert('Booking confirmed! An e-ticket has been sent to the provided email address.');
      }

      // Always return to search page to avoid forced login redirects
      navigate('/agency/search-flights');
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading flight details...</div>;
  if (!flight) return <div className="error">Flight not found</div>;

  const totalPrice = flight.pricePerSeat * seatsToBook;

  return (
    <div className="booking-container">
      <h1>Book Flight</h1>

      <div className="flight-summary">
        <h2>{flight.airlineName} {flight.flightNumber}</h2>
        <p>{flight.departureCity} → {flight.destinationCity}</p>
        <p>{new Date(flight.departureDate).toLocaleDateString()} | {flight.departureTime}</p>
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-section">
          <h3>Select Number of Seats</h3>
          <div className="form-group">
            <label>Seats to Book:</label>
            <select value={seatsToBook} onChange={handleSeatsChange}>
              {Array.from({ length: Math.min(flight.seatsRemaining, 10) }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1} Seat{i + 1 > 1 ? 's' : ''}</option>
              ))}
            </select>
            <p className="info">Available seats: {flight.seatsRemaining}</p>
          </div>
        </div>

        <div className="form-section">
          <h3>Passenger Details</h3>
          {passengers.map((passenger, index) => (
            <div key={index} className="passenger-card">
              <h4>Passenger {index + 1}</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={passenger.name}
                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={passenger.age || ''}
                    onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CNIC</label>
                  <input
                    type="text"
                    value={passenger.cnic}
                    onChange={(e) => handlePassengerChange(index, 'cnic', e.target.value)}
                    placeholder="12345-1234567-1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Passport (Optional)</label>
                  <input
                    type="text"
                    value={passenger.passport}
                    onChange={(e) => handlePassengerChange(index, 'passport', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={passenger.phone}
                    onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={passenger.email}
                    onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="price-summary">
          <h3>Booking Summary</h3>
          <div className="price-row">
            <span>Price per Seat:</span>
            <span>PKR {flight.pricePerSeat.toLocaleString()}</span>
          </div>
          <div className="price-row">
            <span>Number of Seats:</span>
            <span>{seatsToBook}</span>
          </div>
          <div className="price-row total">
            <span>Total Price:</span>
            <span>PKR {totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Processing...' : '✓ Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
