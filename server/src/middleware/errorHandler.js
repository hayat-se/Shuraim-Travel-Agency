const env = require('../config/env');

/** 404 handler for unmatched routes. */
function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Central error handler. Produces a consistent { error } shape and hides internals
 * in production. Recognizes ApiError (explicit status) and common Prisma errors.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Prisma known request errors -> friendlier statuses
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = err.meta && err.meta.target;
    message = `A record with this ${Array.isArray(target) ? target.join(', ') : 'value'} already exists`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Related record does not exist';
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', err);
    if (env.isProduction) message = 'Internal server error';
  }

  res.status(statusCode).json({ error: message });
}

module.exports = { notFoundHandler, errorHandler };
