const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authMiddleware } = require('../middleware/auth');

// Download e-ticket
router.get('/download/:bookingId', ticketController.downloadTicket);

// Get ticket details
router.get('/:bookingId', authMiddleware, ticketController.getTicketDetails);

module.exports = router;
