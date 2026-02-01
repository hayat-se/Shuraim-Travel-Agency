const { Booking, Payment, Flight, Bank } = require('../config/database');

const parseAmount = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value || 0);
  return Number.isNaN(num) ? 0 : num;
};

const buildBookingEntries = (booking) => {
  const entries = [];
  const amount = parseAmount(booking.totalPrice);

  entries.push({
    id: `booking-${booking.id}`,
    date: booking.createdAt,
    type: 'debit',
    source: 'booking',
    reference: booking.bookingId,
    description: `Booking charge (${booking.flight?.departureCity || ''} → ${booking.flight?.destinationCity || ''})`,
    amount,
    status: booking.status,
    affectsBalance: true
  });

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
      affectsBalance: true
    });
  }

  return entries;
};

const buildPaymentEntry = (payment) => {
  return {
    id: `payment-${payment.id}`,
    date: payment.paymentDate || payment.createdAt,
    type: 'credit',
    source: 'payment',
    reference: payment.referenceNumber,
    description: `Payment via ${payment.bank?.bankName || 'Bank'}`,
    amount: parseAmount(payment.amount),
    status: payment.status,
    affectsBalance: payment.status === 'approved'
  };
};

const getAgencyLedger = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { agencyId: req.user.id },
      include: [{ model: Flight, as: 'flight' }],
      order: [['createdAt', 'DESC']]
    });

    const payments = await Payment.findAll({
      where: { agencyId: req.user.id },
      include: [{ model: Bank, as: 'bank' }],
      order: [['createdAt', 'DESC']]
    });

    const entries = bookings.flatMap(buildBookingEntries)
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

      return {
        ...entry,
        runningBalance
      };
    });

    res.status(200).json({
      summary: {
        totalDebit,
        totalCredit,
        balance: runningBalance
      },
      entries: ledgerEntries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAgencyLedger
};
