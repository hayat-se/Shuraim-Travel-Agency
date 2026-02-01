const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, adminOnly, agencyOnly } = require('../middleware/auth');

// Agency: create and view own payments
router.post('/', authMiddleware, agencyOnly, paymentController.createPayment);
router.get('/my', authMiddleware, agencyOnly, paymentController.getAgencyPayments);

// Admin: view and approve/reject payments
router.get('/admin', authMiddleware, adminOnly, paymentController.getAllPayments);
router.put('/admin/:paymentId/status', authMiddleware, adminOnly, paymentController.updatePaymentStatus);

module.exports = router;
