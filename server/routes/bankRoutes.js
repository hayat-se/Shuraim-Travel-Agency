const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const { authMiddleware, adminOnly, agencyOnly } = require('../middleware/auth');
const { createUploader } = require('../middleware/upload');

const uploadBankImage = createUploader('banks');

// Agency: get active banks
router.get('/', authMiddleware, agencyOnly, bankController.getActiveBanks);

// Admin: manage banks
router.get('/admin', authMiddleware, adminOnly, bankController.getAllBanks);
router.post('/admin', authMiddleware, adminOnly, uploadBankImage.single('image'), bankController.createBank);
router.put('/admin/:bankId', authMiddleware, adminOnly, uploadBankImage.single('image'), bankController.updateBank);
router.delete('/admin/:bankId', authMiddleware, adminOnly, bankController.deleteBank);

module.exports = router;
