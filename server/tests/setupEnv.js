// Provide the env vars the app requires so config/env.js doesn't exit the process.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_that_is_long_enough_1234567890';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://u:p@localhost:5432/db';
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:3000';
