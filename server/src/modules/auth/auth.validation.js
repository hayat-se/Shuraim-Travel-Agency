const { body } = require('express-validator');

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

const registerRules = [
  body('agencyName').trim().notEmpty().withMessage('Agency name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('contactPerson').optional({ nullable: true }).isString(),
  body('phone').optional({ nullable: true }).isString(),
];

const requestOtpRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
];

const resetPasswordRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

module.exports = { loginRules, registerRules, requestOtpRules, resetPasswordRules };
