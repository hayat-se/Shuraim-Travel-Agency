const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authMiddleware, adminOnly } = require('../../middleware/auth');
const { uploadImage } = require('../../middleware/upload');
const controller = require('./bank.controller');

const router = express.Router();

// Active banks are shown to agencies (for submitting payment proof).
router.get('/', authMiddleware, asyncHandler(controller.listActive));

router.get('/admin', authMiddleware, adminOnly, asyncHandler(controller.listAll));
router.post('/admin', authMiddleware, adminOnly, uploadImage.single('image'), asyncHandler(controller.create));
router.put('/admin/:id', authMiddleware, adminOnly, uploadImage.single('image'), asyncHandler(controller.update));
router.delete('/admin/:id', authMiddleware, adminOnly, asyncHandler(controller.remove));

module.exports = router;
