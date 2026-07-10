const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('./ApiError');

/** Verifies the Bearer token and attaches the decoded payload to req.user. */
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(ApiError.unauthorized('No token provided'));
  }
  try {
    req.user = jwt.verify(token, env.jwt.secret);
    next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/** Restricts a route to admin / super_admin roles. Use after authMiddleware. */
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
}

/** Restricts a route to agency accounts. Use after authMiddleware. */
function agencyOnly(req, res, next) {
  if (req.user.role !== 'agency') {
    return next(ApiError.forbidden('Agency access required'));
  }
  next();
}

module.exports = { authMiddleware, adminOnly, agencyOnly };
