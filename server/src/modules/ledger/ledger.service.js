const prisma = require('../../config/prisma');

// The ledger is DERIVED (not a stored table): it's assembled from an agency's
// bookings (debits, with refunds on cancellation) and approved payments (credits).

const parseAmount = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value || 0);
  return Number.isNaN(num) ? 0 : num;
};

function buildBookingEntries(booking) {
  const amount = parseAmount(booking.totalPrice);
  const entries = [
    {
      id: `booking-${booking.id}`,
      date: booking.createdAt,
      type: 'debit',
      source: 'booking',
      reference: booking.bookingId,
      description: `Booking charge (${booking.flight?.departureCity || ''} → ${booking.flight?.destinationCity || ''})`,
      amount,
      status: booking.status,
      affectsBalance: true,
    },
  ];
  if (booking.status === 'cancelled') {
    entries.push({
      id: `refund-${booking.id}`,
      date: booking.cancelledAt || booking.updatedAt,
      type: 'credit',
      source: 'refund',
      reference: booking.bookingId,
      description: 'Booking cancellation refund',
      amount,
      status: 'refunded',
      affectsBalance: true,
    });
  }
  return entries;
}

const buildPaymentEntry = (payment) => ({
  id: `payment-${payment.id}`,
  date: payment.paymentDate || payment.createdAt,
  type: 'credit',
  source: 'payment',
  reference: payment.referenceNumber,
  description: `Payment via ${payment.bank?.bankName || 'Bank'}`,
  amount: parseAmount(payment.amount),
  status: payment.status,
  affectsBalance: payment.status === 'approved',
});

async function getAgencyLedger(agencyId) {
  const [bookings, payments] = await Promise.all([
    prisma.booking.findMany({
      where: { agencyId },
      include: { flight: { select: { departureCity: true, destinationCity: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.findMany({
      where: { agencyId },
      include: { bank: { select: { bankName: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const entries = bookings
    .flatMap(buildBookingEntries)
    .concat(payments.map(buildPaymentEntry))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningBalance = 0;
  let totalDebit = 0;
  let totalCredit = 0;

  const ledgerEntries = entries.map((entry) => {
    if (entry.affectsBalance) {
      if (entry.type === 'debit') {
        runningBalance += entry.amount;
        totalDebit += entry.amount;
      } else {
        runningBalance -= entry.amount;
        totalCredit += entry.amount;
      }
    }
    return { ...entry, runningBalance };
  });

  return {
    summary: { totalDebit, totalCredit, balance: runningBalance },
    entries: ledgerEntries,
  };
}

module.exports = { getAgencyLedger };
