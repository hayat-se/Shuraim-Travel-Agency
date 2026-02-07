const express = require('express');
const router = express.Router();
const airlineController = require('../controllers/airlineController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { createUploader } = require('../middleware/upload');

const uploadAirlineLogo = createUploader('airlines');

// Public: get active airlines (for flight form dropdown)
router.get('/active', authMiddleware, airlineController.getActiveAirlines);

// Admin: manage airlines
router.get('/admin', authMiddleware, adminOnly, airlineController.getAllAirlines);
router.post('/admin', authMiddleware, adminOnly, uploadAirlineLogo.single('logo'), airlineController.createAirline);
router.put('/admin/:airlineId', authMiddleware, adminOnly, uploadAirlineLogo.single('logo'), airlineController.updateAirline);
router.delete('/admin/:airlineId', authMiddleware, adminOnly, airlineController.deleteAirline);

module.exports = router;
