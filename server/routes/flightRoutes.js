const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get all flights (public)
router.get('/search', flightController.searchFlights);
router.get('/', flightController.getAllFlights);
router.get('/:flightId', flightController.getFlightById);

// Admin routes
router.post('/', authMiddleware, adminOnly, flightController.createFlight);
router.put('/:flightId', authMiddleware, adminOnly, flightController.updateFlight);
router.delete('/:flightId/cancel', authMiddleware, adminOnly, flightController.cancelFlight);
router.get('/:flightId/availability', flightController.getSeatAvailability);

module.exports = router;
