const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authMiddleware, agencyOnly } = require('../../middleware/auth');
const service = require('./ledger.service');

const router = express.Router();

router.get(
  '/my',
  authMiddleware,
  agencyOnly,
  asyncHandler(async (req, res) => {
    res.json(await service.getAgencyLedger(req.user.id));
  })
);

module.exports = router;
