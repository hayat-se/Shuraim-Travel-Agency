const cron = require('node-cron');
const prisma = require('../config/prisma');

// Business rules (ported from the legacy scheduler, made consistent):
//   - 'pending' bookings become 'hold' after PENDING_TO_HOLD_MIN minutes.
//   - 'hold' / 'cancel_requested' bookings auto-convert to 'sold' once AUTO_SELL_HOURS
//     have elapsed OR the flight has departed (seats stay reserved — a sale, not a release).
const PENDING_TO_HOLD_MIN = 60;
const AUTO_SELL_HOURS = 2;

let task = null;

async function tick() {
  const now = new Date();

  // 1) pending -> hold
  const holdCutoff = new Date(now.getTime() - PENDING_TO_HOLD_MIN * 60 * 1000);
  const movedToHold = await prisma.booking.updateMany({
    where: { status: 'pending', createdAt: { lte: holdCutoff } },
    data: { status: 'hold' },
  });
  if (movedToHold.count) {
    // eslint-disable-next-line no-console
    console.log(`[scheduler] moved ${movedToHold.count} pending booking(s) to hold`);
  }

  // 2) hold / cancel_requested -> sold (time elapsed OR flight departed)
  const sellCutoff = new Date(now.getTime() - AUTO_SELL_HOURS * 60 * 60 * 1000);
  const candidates = await prisma.booking.findMany({
    where: { status: { in: ['hold', 'cancel_requested'] } },
    include: { flight: { select: { departureDate: true, departureTime: true } } },
  });

  let sold = 0;
  for (const b of candidates) {
    let shouldSell = new Date(b.createdAt) <= sellCutoff;
    if (!shouldSell && b.flight) {
      const dep = new Date(b.flight.departureDate);
      if (b.flight.departureTime) {
        const [h, m] = b.flight.departureTime.split(':').map(Number);
        dep.setHours(h || 0, m || 0, 0, 0);
      }
      if (dep < now) shouldSell = true;
    }
    if (shouldSell) {
      await prisma.booking.update({ where: { id: b.id }, data: { status: 'sold', paymentStatus: 'completed' } });
      sold += 1;
    }
  }
  if (sold) {
    // eslint-disable-next-line no-console
    console.log(`[scheduler] auto-sold ${sold} booking(s)`);
  }
}

function startBookingScheduler() {
  if (task) return task;
  // eslint-disable-next-line no-console
  console.log('[scheduler] starting booking scheduler (every 2 minutes)');
  tick().catch((e) => console.error('[scheduler] initial run failed:', e.message));
  task = cron.schedule('*/2 * * * *', () => {
    tick().catch((e) => console.error('[scheduler] run failed:', e.message));
  });
  return task;
}

module.exports = { startBookingScheduler, tick };
