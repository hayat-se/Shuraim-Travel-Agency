const { PrismaClient } = require('@prisma/client');
const env = require('./env');

/**
 * Single PrismaClient instance for the whole process.
 * A dev-time global guard prevents connection exhaustion when nodemon hot-reloads.
 */
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: env.isProduction ? ['warn', 'error'] : ['warn', 'error'],
  });

if (!env.isProduction) {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
