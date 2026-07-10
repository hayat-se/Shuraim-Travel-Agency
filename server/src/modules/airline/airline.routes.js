const express = require('express');
const asyncHandler = require('../../middleware/asyncHandler');
const { authMiddleware, adminOnly } = require('../../middleware/auth');
const { uploadImage } = require('../../middleware/upload');
const controller = require('./airline.controller');

const router = express.Router();

// Active list is readable by any authenticated user (agencies pick airlines when searching).
router.get('/active', authMiddleware, asyncHandler(controller.listActive));

// Admin management.
router.get('/admin', authMiddleware, adminOnly, asyncHandler(controller.listAll));
router.post('/admin', authMiddleware, adminOnly, uploadImage.single('logo'), asyncHandler(controller.create));
router.put('/admin/:id', authMiddleware, adminOnly, uploadImage.single('logo'), asyncHandler(controller.update));
router.delete('/admin/:id', authMiddleware, adminOnly, asyncHandler(controller.remove));

module.exports = router;
