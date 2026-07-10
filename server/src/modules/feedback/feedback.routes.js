const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authMiddleware, adminOnly, agencyOnly } = require('../../middleware/auth');
const controller = require('./feedback.controller');

const router = express.Router();

// Agency
router.post('/', authMiddleware, agencyOnly, asyncHandler(controller.create));
router.get('/my', authMiddleware, agencyOnly, asyncHandler(controller.listMine));

// Admin
router.get('/admin', authMiddleware, adminOnly, asyncHandler(controller.listAll));
router.put('/admin/:id', authMiddleware, adminOnly, asyncHandler(controller.updateStatus));

module.exports = router;
