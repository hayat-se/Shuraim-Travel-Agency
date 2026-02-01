const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const { authMiddleware, adminOnly, agencyOnly } = require('../middleware/auth');

// Agency: get active banks
router.get('/', authMiddleware, agencyOnly, bankController.getActiveBanks);

// Admin: manage banks
router.get('/admin', authMiddleware, adminOnly, bankController.getAllBanks);
router.post('/admin', authMiddleware, adminOnly, bankController.createBank);
router.put('/admin/:bankId', authMiddleware, adminOnly, bankController.updateBank);

module.exports = router;
