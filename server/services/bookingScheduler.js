const { Booking, Flight } = require('../config/database');

const AUTO_SELL_HOURS = 2; // Bookings auto-convert to 'sold' after 2 hours

/**
 * Update bookings from 'hold' to 'sold':
 *   1. If 2 hours have passed since booking was created (not cancelled) → sold
 *   2. If flight departure time has passed → sold
 */
const updateBookingStatuses = async () => {
  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - AUTO_SELL_HOURS * 60 * 60 * 1000);

    // Get all 'hold' or 'cancel_requested' bookings
    const holdBookings = await Booking.findAll({
      where: { status: ['hold', 'cancel_requested'] },
      include: [{ model: Flight, as: 'flight' }]
    });

    let updatedCount = 0;

    for (const booking of holdBookings) {
      let shouldSell = false;
      let reason = '';

      // Rule 1: If 2 hours have passed since booking creation → auto-sell
      const bookingCreatedAt = new Date(booking.createdAt);
      if (bookingCreatedAt <= twoHoursAgo) {
        shouldSell = true;
        reason = `2+ hours elapsed since booking (created ${bookingCreatedAt.toISOString()})`;
      }

      // Rule 2: If flight departure time has passed → sell
      if (!shouldSell && booking.flight) {
        const flightDepartureDate = new Date(booking.flight.departureDate);
        if (booking.flight.departureTime) {
          const [hours, minutes] = booking.flight.departureTime.split(':').map(Number);
          flightDepartureDate.setHours(hours, minutes, 0, 0);
        }
        if (flightDepartureDate < now) {
          shouldSell = true;
          reason = 'flight has departed';
        }
      }

      if (shouldSell) {
        await booking.update({ status: 'sold', paymentStatus: 'completed' });
        updatedCount++;
        console.log(`[BookingScheduler] ${booking.bookingId} → sold (${reason})`);
      }
    }

    if (updatedCount > 0) {
      console.log(`[BookingScheduler] ${updatedCount} booking(s) updated to 'sold'`);
    }
  } catch (error) {
    console.error('[BookingScheduler] Error updating booking statuses:', error.message);
  }
};

/**
 * Start the booking scheduler
 * Runs every 2 minutes to check and update booking statuses
 */
const startBookingScheduler = () => {
  console.log('[BookingScheduler] Starting booking scheduler (auto-sell after 2 hours)...');

  // Run immediately on start
  updateBookingStatuses();

  // Then run every 2 minutes (120000 ms)
  setInterval(updateBookingStatuses, 120000);
};

module.exports = {
  startBookingScheduler,
  updateBookingStatuses
};
