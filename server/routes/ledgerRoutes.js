const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const { authMiddleware, agencyOnly } = require('../middleware/auth');

// Agency ledger
router.get('/my', authMiddleware, agencyOnly, ledgerController.getAgencyLedger);

module.exports = router;
