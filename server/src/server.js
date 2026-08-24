const env = require('./config/env');
const createApp = require('./app');
const prisma = require('./config/prisma');
const { startBookingScheduler } = require('./jobs/bookingScheduler');

const app = createApp();

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] Shuraim API listening on port ${env.port} (${env.nodeEnv})`);
  startBookingScheduler();
  keepWarm();
});

// Keep the free-tier host warm while it's running by pinging our own health
// endpoint every ~10 min. (Can't self-recover once fully asleep — that's what the
// external pinger / GitHub Action is for — but it prevents idle spin-downs.)
function keepWarm() {
  const selfUrl = process.env.RENDER_EXTERNAL_URL;
  if (!env.isProduction || !selfUrl || typeof fetch !== 'function') return;
  setInterval(() => {
    fetch(`${selfUrl.replace(/\/$/, '')}/api/health`).catch(() => {});
  }, 10 * 60 * 1000).unref();
}

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
