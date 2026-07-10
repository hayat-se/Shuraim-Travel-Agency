const prisma = require('../../config/prisma');

async function adminStats() {
  const [
    totalFlights,
    totalAgencies,
    pendingAgencies,
    soldTickets,
    holdTickets,
    canceledTickets,
    totalBookings,
    revenue,
  ] = await Promise.all([
    prisma.flight.count({ where: { status: 'active' } }),
    prisma.agency.count({ where: { status: 'approved' } }),
    prisma.agency.count({ where: { status: 'pending' } }),
    prisma.booking.count({ where: { status: 'sold' } }),
    prisma.booking.count({ where: { status: { in: ['hold', 'cancel_requested'] } } }),
    prisma.booking.count({ where: { status: 'cancelled' } }),
    prisma.booking.count(),
    prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: { not: 'cancelled' } } }),
  ]);

  return {
    totalFlights,
    soldTickets,
    holdTickets,
    canceledTickets,
    totalAgencies,
    pendingAgencies,
    totalBookings,
    totalRevenue: Number(revenue._sum.totalPrice || 0),
  };
}

async function agencyStats(agencyId) {
  const [soldTickets, holdTickets, cancelledTickets, agency] = await Promise.all([
    prisma.booking.count({ where: { agencyId, status: 'sold' } }),
    prisma.booking.count({ where: { agencyId, status: { in: ['hold', 'cancel_requested'] } } }),
    prisma.booking.count({ where: { agencyId, status: 'cancelled' } }),
    prisma.agency.findUnique({ where: { id: agencyId }, select: { agencyName: true, city: true } }),
  ]);

  return {
    soldTickets,
    holdTickets,
    cancelledTickets,
    agencyName: agency?.agencyName || '',
    city: agency?.city || '',
  };
}

module.exports = { adminStats, agencyStats };
