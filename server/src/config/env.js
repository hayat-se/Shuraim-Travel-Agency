require('dotenv').config();

/**
 * Centralized, validated environment configuration.
 * Fails fast at boot if a required secret is missing — this removes the previous
 * hardcoded JWT fallback ('your_jwt_secret_key_here...') that shipped to production.
 */

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'];

const missing = REQUIRED.filter((key) => !process.env[key] || !process.env[key].trim());
if (missing.length) {
  // eslint-disable-next-line no-console
  console.error(
    `\n[FATAL] Missing required environment variable(s): ${missing.join(', ')}\n` +
      `Set them in server/.env (see .env.example) before starting the server.\n`
  );
  process.exit(1);
}

// JWT secrets shorter than 32 chars are trivially brute-forceable — warn loudly.
if (process.env.JWT_SECRET.length < 32) {
  // eslint-disable-next-line no-console
  console.warn('[WARN] JWT_SECRET is shorter than 32 characters. Use a long random secret in production.');
}

const optionalWarn = (key) => {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${key} is not set — related features will be disabled/degraded.`);
  }
};

['RESEND_API_KEY', 'EMAIL_FROM'].forEach(optionalWarn);

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: parseInt(process.env.PORT || '5000', 10),

  databaseUrl: process.env.DATABASE_URL,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },

  // Comma-separated allowlist, e.g. "https://shuraim-travel-agency.vercel.app,http://localhost:3000"
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),

  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'uploads',
  },

  // Minutes a 'hold' booking survives before the scheduler auto-releases its seats.
  holdExpiryMinutes: parseInt(process.env.HOLD_EXPIRY_MINUTES || '30', 10),
};
