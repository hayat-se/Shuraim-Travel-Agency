const { Booking, Flight } = require('../config/database');

/**
 * Update bookings from 'hold' to 'sold' when flight departure time has passed
 * This runs periodically to sync booking statuses with flight departure times
 */
const updateBookingStatusesFromFlightDeparture = async () => {
  try {
    const now = new Date();

    // Get all 'hold' or 'cancel_requested' bookings
    const holdBookings = await Booking.findAll({
      where: { status: ['hold', 'cancel_requested'] },
      include: [{ model: Flight, as: 'flight' }]
    });

    for (const booking of holdBookings) {
      if (!booking.flight) continue;

      // If ticket is generated or payment completed, mark as sold immediately
      if (booking.ticketGenerated || booking.paymentStatus === 'completed') {
        await booking.update({ status: 'sold' });
        console.log(`[BookingScheduler] Booking ${booking.bookingId} status updated to 'sold' (payment/ticket)`);
        continue;
      }

      // Parse flight departure date and time
      const flightDepartureDate = new Date(booking.flight.departureDate);
      const [hours, minutes] = booking.flight.departureTime.split(':').map(Number);
      flightDepartureDate.setHours(hours, minutes, 0, 0);

      // If departure time has passed, mark as 'sold'
      if (flightDepartureDate < now) {
        await booking.update({ status: 'sold' });
        console.log(`[BookingScheduler] Booking ${booking.bookingId} status updated from '${booking.status}' to 'sold'`);
      }
    }
  } catch (error) {
    console.error('[BookingScheduler] Error updating booking statuses:', error.message);
  }
};

/**
 * Start the booking scheduler
 * Runs every 5 minutes to check and update booking statuses
 */
const startBookingScheduler = () => {
  console.log('[BookingScheduler] Starting booking scheduler...');
  
  // Run immediately on start
  updateBookingStatusesFromFlightDeparture();
  
  // Then run every 5 minutes (300000 ms)
  setInterval(updateBookingStatusesFromFlightDeparture, 300000);
};

module.exports = {
  startBookingScheduler,
  updateBookingStatusesFromFlightDeparture
};
