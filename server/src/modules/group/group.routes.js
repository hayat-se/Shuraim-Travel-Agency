const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authMiddleware, adminOnly } = require('../../middleware/auth');
const { uploadImage } = require('../../middleware/upload');
const controller = require('./group.controller');

const router = express.Router();

// Active groups are shown on the agency dashboard + search filters.
router.get('/', authMiddleware, asyncHandler(controller.listActive));

router.get('/admin', authMiddleware, adminOnly, asyncHandler(controller.listAll));
router.post('/admin', authMiddleware, adminOnly, uploadImage.single('image'), asyncHandler(controller.create));
router.put('/admin/:id', authMiddleware, adminOnly, uploadImage.single('image'), asyncHandler(controller.update));

module.exports = router;
