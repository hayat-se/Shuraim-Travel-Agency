const { Booking, Flight, Agency, AuditLog, Airline } = require('../config/database');
const { generateETicket } = require('../services/pdfService');
const { sendBookingConfirmationEmail } = require('../services/emailService');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Helper: resolve airline logo file path on disk
const getAirlineLogoPath = async (airlineName) => {
  try {
    if (!Airline) return null;
    const airline = await Airline.findOne({ where: { name: airlineName } });
    if (airline && airline.logoUrl) {
      const absPath = path.join(__dirname, '..', 'public', airline.logoUrl);
      return fs.existsSync(absPath) ? absPath : null;
    }
  } catch (e) {
    console.error('Airline logo lookup failed:', e.message);
  }
  return null;
};

// Create booking (Agency only)
const createBooking = async (req, res) => {
  try {
    const { flightId, seatsBooked, passengers } = req.body;

    // Validate inputs
    if (!flightId || !seatsBooked || !passengers || passengers.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (passengers.length !== seatsBooked) {
      return res.status(400).json({ error: 'Number of passengers must match seats booked' });
    }

    // Get flight details
    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    if (flight.status !== 'active') {
      return res.status(400).json({ error: 'Flight is not available for booking' });
    }

    // Check seat availability (Prevent overbooking)
    if (flight.seatsRemaining < seatsBooked) {
      return res.status(400).json({
        error: 'Not enough seats available',
        availableSeats: flight.seatsRemaining
      });
    }

    // Generate booking ID
    const bookingId = 'BK' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Calculate total price
    const totalPrice = flight.pricePerSeat * seatsBooked;

    // Create booking in 'hold' status initially
    const newBooking = await Booking.create({
      bookingId,
      flightId: flightId,
      agencyId: req.user.id,
      seatsBooked,
      totalPrice,
      passengers,
      status: 'hold',
      paymentStatus: 'pending'
    });

    // Update flight seats
    await flight.update({
      seatsBooked: flight.seatsBooked + seatsBooked,
      seatsRemaining: flight.seatsRemaining - seatsBooked
    });

    // Update agency statistics
    const agency = await Agency.findByPk(req.user.id);
    await agency.update({
      totalBookings: agency.totalBookings + 1,
      totalRevenue: agency.totalRevenue + totalPrice
    });

    // Create audit log
    await AuditLog.create({
      action: 'booking_created',
      userId: req.user.id,
      userRole: req.user.role,
      userEmail: req.user.email,
      bookingId: newBooking.id,
      flightId: flightId,
      agencyId: req.user.id,
      details: { seatsBooked, totalPrice }
    });

    // Generate e-ticket
    const airlineLogoPath = await getAirlineLogoPath(flight.airlineName);
    const ticketPath = await generateETicket(newBooking, flight, agency, airlineLogoPath);

    // Update booking with ticket URL
    await newBooking.update({
      ticketGenerated: true,
      ticketUrl: `/api/tickets/download/${newBooking.bookingId}`
    });

    // Send confirmation email with ticket
    await sendBookingConfirmationEmail(
      agency.email,
      agency.agencyName,
      bookingId,
      flight,
      totalPrice,
      ticketPath
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking,
      ticketUrl: newBooking.ticketUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get agency bookings
const getAgencyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { agencyId: req.user.id },
      include: [{ model: Flight, as: 'flight' }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      where: { bookingId },
      include: [
        { model: Flight, as: 'flight' },
        { model: Agency, as: 'agency' }
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Flight, as: 'flight' },
        { model: Agency, as: 'agency' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel booking (Agency owner requests, Admin approves/cancels)
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findOne({
      where: { bookingId }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization - must be admin or the agency that created the booking
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && booking.agencyId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    if (booking.status === 'sold') {
      return res.status(400).json({ error: 'Cannot cancel a sold ticket' });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    if (!isAdmin) {
      // Agency can only cancel within 1 hour of booking
      const bookingAge = Date.now() - new Date(booking.createdAt).getTime();
      const ONE_HOUR = 60 * 60 * 1000;

      if (bookingAge > ONE_HOUR) {
        return res.status(400).json({ error: 'Cancellation window expired. Bookings can only be cancelled within 1 hour of booking.' });
      }
    }

    // Direct cancellation (agency within 1hr or admin anytime)
    const flight = await Flight.findByPk(booking.flightId);
    await flight.update({
      seatsBooked: flight.seatsBooked - booking.seatsBooked,
      seatsRemaining: flight.seatsRemaining + booking.seatsBooked
    });

    await booking.update({
      status: 'cancelled',
      cancellationReason: reason || null,
      cancelledBy: req.user.role,
      cancelledAt: new Date()
    });

    await AuditLog.create({
      action: 'booking_cancelled',
      userId: req.user.id,
      userRole: req.user.role,
      userEmail: req.user.email,
      bookingId: booking.id,
      flightId: booking.flightId,
      details: { seatsFreed: booking.seatsBooked, reason: reason || 'No reason provided' }
    });

    res.status(200).json({
      message: 'Booking cancelled successfully',
      booking: booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create guest booking (Public - No authentication required)
const createGuestBooking = async (req, res) => {
  try {
    const { flightId, seatsBooked, passengers } = req.body;

    // Validate inputs
    if (!flightId || !seatsBooked || !passengers || passengers.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (passengers.length !== seatsBooked) {
      return res.status(400).json({ error: 'Number of passengers must match seats booked' });
    }

    // Validate at least first passenger has email for ticket delivery
    if (!passengers[0].email) {
      return res.status(400).json({ error: 'Email is required for the first passenger to receive the e-ticket' });
    }

    // Get flight details
    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    if (flight.status !== 'active') {
      return res.status(400).json({ error: 'Flight is not available for booking' });
    }

    // Check seat availability
    if (flight.seatsRemaining < seatsBooked) {
      return res.status(400).json({
        error: 'Not enough seats available',
        availableSeats: flight.seatsRemaining
      });
    }

    // Generate booking ID
    const bookingId = 'BK' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Calculate total price
    const totalPrice = flight.pricePerSeat * seatsBooked;

    // Create booking with null agencyId for guest bookings
    const newBooking = await Booking.create({
      bookingId,
      flightId: flightId,
      agencyId: null, // Guest booking
      seatsBooked,
      totalPrice,
      passengers,
      status: 'sold',
      paymentStatus: 'completed'
    });

    // Update flight seats
    await flight.update({
      seatsBooked: flight.seatsBooked + seatsBooked,
      seatsRemaining: flight.seatsRemaining - seatsBooked
    });

    // Generate e-ticket with guest info
    const guestInfo = {
      email: passengers[0].email,
      agencyName: 'Guest Booking',
      contactPerson: passengers[0].name,
      phone: passengers[0].phone || ''
    };
    const airlineLogoPath = await getAirlineLogoPath(flight.airlineName);
    const ticketPath = await generateETicket(newBooking, flight, guestInfo, airlineLogoPath);

    // Update booking with ticket URL
    await newBooking.update({
      ticketGenerated: true,
      ticketUrl: `/api/tickets/download/${newBooking.bookingId}`
    });

    // Send confirmation email to passenger
    await sendBookingConfirmationEmail(
      passengers[0].email,
      passengers[0].name,
      bookingId,
      flight,
      totalPrice,
      ticketPath
    );

    res.status(201).json({
      message: 'Booking created successfully! E-ticket sent to your email.',
      booking: {
        bookingId: newBooking.bookingId,
        flightNumber: flight.flightNumber,
        totalPrice: newBooking.totalPrice,
        status: newBooking.status
      }
    });
  } catch (error) {
    console.error('Guest booking error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBooking,
  createGuestBooking,
  getAgencyBookings,
  getBookingById,
  getAllBookings,
  cancelBooking
};
