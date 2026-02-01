const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware, adminOnly, agencyOnly } = require('../middleware/auth');

// Agency: submit and view own feedback
router.post('/', authMiddleware, agencyOnly, feedbackController.createFeedback);
router.get('/my', authMiddleware, agencyOnly, feedbackController.getAgencyFeedback);

// Admin: view and update feedback
router.get('/admin', authMiddleware, adminOnly, feedbackController.getAllFeedback);
router.put('/admin/:feedbackId', authMiddleware, adminOnly, feedbackController.updateFeedbackStatus);

module.exports = router;
