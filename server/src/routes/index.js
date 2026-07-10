const express = require('express');
const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

/** Liveness + DB connectivity probe. */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  })
);

// --- Module routers (paths match the existing frontend exactly) ---------------
router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/admin/agencies', require('../modules/agency/agency.routes'));
router.use('/admin/flights', require('../modules/flight/flight.routes'));
router.use('/airlines', require('../modules/airline/airline.routes'));
router.use('/groups', require('../modules/group/group.routes'));
router.use('/banks', require('../modules/bank/bank.routes'));
router.use('/feedback', require('../modules/feedback/feedback.routes'));
router.use('/payments', require('../modules/payment/payment.routes'));
router.use('/ledger', require('../modules/ledger/ledger.routes'));
router.use('/bookings', require('../modules/booking/booking.routes'));
router.use('/tickets', require('../modules/ticket/ticket.routes'));
router.use('/dashboard', require('../modules/dashboard/dashboard.routes'));
router.use('/images', require('../modules/image/image.routes'));

module.exports = router;
