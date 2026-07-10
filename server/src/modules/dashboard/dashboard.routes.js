const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authMiddleware, adminOnly, agencyOnly } = require('../../middleware/auth');
const service = require('./dashboard.service');

const router = express.Router();

router.get(
  '/admin/stats',
  authMiddleware,
  adminOnly,
  asyncHandler(async (req, res) => res.json(await service.adminStats()))
);

router.get(
  '/agency/stats',
  authMiddleware,
  agencyOnly,
  asyncHandler(async (req, res) => res.json(await service.agencyStats(req.user.id)))
);

module.exports = router;
