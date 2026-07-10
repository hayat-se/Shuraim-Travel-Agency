const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authMiddleware, adminOnly } = require('../../middleware/auth');
const controller = require('./agency.controller');

const router = express.Router();

// All agency-management routes are admin-only. Mounted at /api/admin/agencies.
router.use(authMiddleware, adminOnly);

router.get('/', asyncHandler(controller.listAll));
router.get('/pending', asyncHandler(controller.listPending));
router.put('/:id/approve', asyncHandler(controller.approve));
router.put('/:id/reject', asyncHandler(controller.reject));
router.put('/:id/block', asyncHandler(controller.block));
router.put('/:id/unblock', asyncHandler(controller.unblock));

module.exports = router;
