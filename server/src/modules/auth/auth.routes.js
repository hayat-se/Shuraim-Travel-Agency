const express = require('express');
const rateLimit = require('express-rate-limit');
const asyncHandler = require('../../middleware/asyncHandler');
const validate = require('../../middleware/validate');
const controller = require('./auth.controller');
const {
  loginRules,
  registerRules,
  requestOtpRules,
  resetPasswordRules,
} = require('./auth.validation');

const router = express.Router();

// Stricter limiter on credential endpoints to blunt brute-force / enumeration.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
});

router.post('/admin/login', authLimiter, loginRules, validate, asyncHandler(controller.adminLogin));
router.post('/agency/register', authLimiter, registerRules, validate, asyncHandler(controller.agencyRegister));
router.post('/agency/login', authLimiter, loginRules, validate, asyncHandler(controller.agencyLogin));
router.post('/agency/password/otp', authLimiter, requestOtpRules, validate, asyncHandler(controller.requestAgencyPasswordReset));
router.post('/agency/password/reset', authLimiter, resetPasswordRules, validate, asyncHandler(controller.resetAgencyPassword));

module.exports = router;
