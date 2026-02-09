// Agency update booking details (within 1 hour)
router.put('/:bookingId/update', authMiddleware, bookingController.updateBookingDetails);
// Admin confirm booking
router.put('/:bookingId/confirm', authMiddleware, adminOnly, bookingController.confirmBooking);
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware, agencyOnly, adminOnly } = require('../middleware/auth');
// Create guest booking (Public - No auth required)
router.post('/guest', bookingController.createGuestBooking);


// Create booking (Agency only)
router.post('/', authMiddleware, agencyOnly, bookingController.createBooking);

// Get agency bookings (Agency only)
router.get('/my-bookings', authMiddleware, agencyOnly, bookingController.getAgencyBookings);

// Get booking by ID
router.get('/:bookingId', authMiddleware, bookingController.getBookingById);

// Get all bookings (Admin only)
router.get('/', authMiddleware, adminOnly, bookingController.getAllBookings);

// Cancel booking (Agency owner)
router.put('/agency/:bookingId/cancel', authMiddleware, agencyOnly, bookingController.cancelBooking);

// Cancel booking (Admin or Agency owner)
router.put('/:bookingId/cancel', authMiddleware, bookingController.cancelBooking);

module.exports = router;
