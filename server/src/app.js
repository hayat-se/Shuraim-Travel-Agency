const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const env = require('./config/env');
const apiRouter = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

/**
 * Builds and returns the Express app WITHOUT calling listen().
 * Keeping listen() out of here lets Supertest import the app directly for tests.
 */
function createApp() {
  const app = express();

  app.set('trust proxy', 1); // correct client IPs behind Railway/Render/Fly proxies

  app.use(helmet());
  app.use(compression());

  // CORS: allow only configured origins. Empty allowlist => reflect origin in dev,
  // deny cross-origin in production (fail closed).
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true); // curl / same-origin / mobile
        if (env.corsOrigins.length === 0) return cb(null, !env.isProduction);
        return cb(null, env.corsOrigins.includes(origin));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Global rate limit (stricter auth limiter lives in the auth module).
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later.' },
    })
  );

  // Static assets (airline logos, generated tickets) — served from disk for now;
  // Phase 3 migrates these to Supabase Storage.
  app.use('/static', express.static(path.join(__dirname, '..', 'public')));

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
