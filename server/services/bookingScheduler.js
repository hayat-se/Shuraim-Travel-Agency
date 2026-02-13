const { Booking, Flight } = require('../config/database');

const AUTO_SELL_HOURS = 2; // Bookings auto-convert to 'sold' after 2 hours
const AUTO_CANCEL_PENDING_MINUTES = 60; // Pending bookings auto-cancel after 1 hour

/**
 * Update bookings from 'hold' to 'sold':
 *   1. If 2 hours have passed since booking was created (not cancelled) → sold
 *   2. If flight departure time has passed → sold
 */
const updateBookingStatuses = async () => {
  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - AUTO_SELL_HOURS * 60 * 60 * 1000);

    // After 1 hour, move 'pending' bookings to 'hold'
    const oneHourAgo = new Date(now.getTime() - AUTO_CANCEL_PENDING_MINUTES * 60 * 1000);
    const pendingBookings = await Booking.findAll({ where: { status: 'pending' } });
    let movedToHoldCount = 0;
    for (const booking of pendingBookings) {
      const bookingCreatedAt = new Date(booking.createdAt);
      if (bookingCreatedAt <= oneHourAgo) {
        await booking.update({ status: 'hold' });
        movedToHoldCount++;
        console.log(`[BookingScheduler] ${booking.bookingId} moved to hold after 1 hour pending`);
      }
    }

    // Auto-cancel 'hold' bookings that were not confirmed after another hour (2 hours from creation)
    const twoHoursAgo = new Date(now.getTime() - 2 * AUTO_CANCEL_PENDING_MINUTES * 60 * 1000);
    const holdBookingsToCancel = await Booking.findAll({ where: { status: 'hold' } });
    let cancelledCount = 0;
    for (const booking of holdBookingsToCancel) {
      const bookingCreatedAt = new Date(booking.createdAt);
      if (bookingCreatedAt <= twoHoursAgo) {
        await booking.update({ status: 'cancelled' });
        cancelledCount++;
        console.log(`[BookingScheduler] ${booking.bookingId} auto-cancelled after 2 hours (hold)`);
      }
    }

    // Existing logic for 'hold' and 'cancel_requested' bookings
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
    if (cancelledCount > 0) {
      console.log(`[BookingScheduler] ${cancelledCount} booking(s) auto-cancelled after 1 hour pending`);
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
