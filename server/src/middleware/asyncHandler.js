/**
 * Wraps an async route handler so any rejected promise is forwarded to Express's
 * error handler instead of crashing the process or hanging the request.
 *
 *   router.get('/', asyncHandler(async (req, res) => { ... }));
 */
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
