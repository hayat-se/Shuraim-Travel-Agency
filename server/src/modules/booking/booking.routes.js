const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authMiddleware, adminOnly, agencyOnly } = require('../../middleware/auth');
const controller = require('./booking.controller');

const router = express.Router();

// Public guest booking (no auth).
router.post('/guest', asyncHandler(controller.createGuest));

// Agency-scoped reads/writes.
router.get('/my-bookings', authMiddleware, agencyOnly, asyncHandler(controller.listMine));
router.post('/', authMiddleware, agencyOnly, asyncHandler(controller.create));

// Admin list.
router.get('/', authMiddleware, adminOnly, asyncHandler(controller.listAll));

// Mutations on a specific booking (declare before the bare :bookingId GET).
router.put('/:bookingId/update', authMiddleware, asyncHandler(controller.update));
router.put('/:bookingId/confirm', authMiddleware, adminOnly, asyncHandler(controller.confirm));
router.put('/agency/:bookingId/cancel', authMiddleware, agencyOnly, asyncHandler(controller.cancel));
router.put('/:bookingId/cancel', authMiddleware, asyncHandler(controller.cancel));

// Single booking lookup (any authenticated user; ownership enforced where it matters).
router.get('/:bookingId', authMiddleware, asyncHandler(controller.getOne));

module.exports = router;
