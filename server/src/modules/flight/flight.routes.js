const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const validate = require('../../middleware/validate');
const { authMiddleware, adminOnly } = require('../../middleware/auth');
const controller = require('./flight.controller');
const { createRules } = require('./flight.validation');

const router = express.Router();

// Any authenticated user (admin or agency) may read flights.
router.use(authMiddleware);

// Specific paths before the :flightId param route.
router.get('/search', asyncHandler(controller.search));
router.get('/', asyncHandler(controller.list));
router.get('/:flightId/availability', asyncHandler(controller.availability));
router.get('/:flightId', asyncHandler(controller.getById));

// Mutations are admin-only.
router.post('/', adminOnly, createRules, validate, asyncHandler(controller.create));
router.put('/:flightId', adminOnly, asyncHandler(controller.update));
router.delete('/:flightId/cancel', adminOnly, asyncHandler(controller.cancel));
router.delete('/:flightId', adminOnly, asyncHandler(controller.remove));

module.exports = router;
