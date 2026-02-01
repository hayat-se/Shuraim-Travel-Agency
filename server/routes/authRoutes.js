const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Auth routes
router.post('/admin/login', authController.adminLogin);
router.post('/agency/register', authController.agencyRegister);
router.post('/agency/login', authController.agencyLogin);

module.exports = router;
