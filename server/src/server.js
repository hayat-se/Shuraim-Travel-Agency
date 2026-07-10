const env = require('./config/env');
const createApp = require('./app');
const prisma = require('./config/prisma');
const { startBookingScheduler } = require('./jobs/bookingScheduler');

const app = createApp();

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] Shuraim API listening on port ${env.port} (${env.nodeEnv})`);
  startBookingScheduler();
});

// Graceful shutdown so Prisma releases its pool cleanly on redeploy.
async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`[server] ${signal} received, shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

['SIGTERM', 'SIGINT'].forEach((sig) => process.on(sig, () => shutdown(sig)));

module.exports = server;
