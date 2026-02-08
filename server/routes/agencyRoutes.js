const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get pending agencies (Admin only)
router.get('/pending', authMiddleware, adminOnly, authController.getPendingAgencies);

// Get all agencies (Admin only)
router.get('/', authMiddleware, adminOnly, authController.getAllAgencies);

// Approve agency (Admin only)
router.put('/:agencyId/approve', authMiddleware, adminOnly, authController.approveAgency);

// Reject agency (Admin only)
router.put('/:agencyId/reject', authMiddleware, adminOnly, authController.rejectAgency);

// Block agency (Admin only)
router.put('/:agencyId/block', authMiddleware, adminOnly, authController.blockAgency);

// Unblock agency (Admin only)
router.put('/:agencyId/unblock', authMiddleware, adminOnly, authController.unblockAgency);

module.exports = router;
