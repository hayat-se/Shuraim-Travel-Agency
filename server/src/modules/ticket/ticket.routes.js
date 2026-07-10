const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authMiddleware } = require('../../middleware/auth');
const controller = require('./ticket.controller');

const router = express.Router();

// Download is intentionally unauthenticated: the ticket URL is the delivery
// mechanism (opened directly in a browser tab / from email). The bookingId acts
// as an unguessable token.
router.get('/download/:bookingId', asyncHandler(controller.download));

// Ticket detail view requires auth.
router.get('/:bookingId', authMiddleware, asyncHandler(controller.details));

module.exports = router;
