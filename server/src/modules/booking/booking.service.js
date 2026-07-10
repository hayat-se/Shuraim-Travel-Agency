const crypto = require('crypto');
const prisma = require('../../config/prisma');
const ApiError = require('../../middleware/ApiError');
const audit = require('../../services/auditService');
const { generateETicket } = require('../../services/pdfService');
const { sendBookingConfirmationEmail } = require('../../services/emailService');

const ONE_HOUR = 60 * 60 * 1000;
const FLIGHT_SELECT = { flight: true };

const genBookingId = () => 'BK' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();

function validatePassengers(seatsBooked, passengers) {
  if (!seatsBooked || !Array.isArray(passengers) || passengers.length === 0) {
    throw ApiError.badRequest('Missing required fields');
  }
  if (passengers.length !== Number(seatsBooked)) {
    throw ApiError.badRequest('Number of passengers must match seats booked');
  }
}

/**
 * Atomically reserve seats and create the booking. The conditional updateMany
 * (WHERE seatsRemaining >= n AND status = active) is the concurrency guard:
 * two racing requests for the last seat cannot both succeed — the second one
 * matches zero rows and is rejected. Everything runs in one transaction.
 */
async function reserveAndCreate({ flightId, seatsBooked, passengers, agencyId, status, paymentStatus }) {
  const seats = Number(seatsBooked);
  return prisma.$transaction(async (tx) => {
    const flight = await tx.flight.findUnique({ where: { id: Number(flightId) } });
    if (!flight) throw ApiError.notFound('Flight not found');
    if (flight.status !== 'active') throw ApiError.badRequest('Flight is not available for booking');

    const reserved = await tx.flight.updateMany({
      where: { id: flight.id, status: 'active', seatsRemaining: { gte: seats } },
      data: { seatsBooked: { increment: seats }, seatsRemaining: { decrement: seats } },
    });
    if (reserved.count === 0) {
      throw ApiError.badRequest('Not enough seats available');
    }

    const booking = await tx.booking.create({
      data: {
        bookingId: genBookingId(),
        flightId: flight.id,
        agencyId: agencyId ?? null,
        seatsBooked: seats,
        totalPrice: Number(flight.pricePerSeat) * seats,
        passengers,
        status,
        paymentStatus,
      },
    });
    return { booking, flight };
  });
}

// Generate the e-ticket and persist its URL. Failures here must not roll back the
// booking (the seats are already reserved) — we log and continue.
async function attachTicket(booking, flight, recipient) {
  try {
    const ticketPath = await generateETicket(booking, flight, recipient, null);
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { ticketGenerated: true, ticketUrl: `/api/tickets/download/${booking.bookingId}` },
    });
    if (recipient?.email) {
      sendBookingConfirmationEmail(recipient.email, recipient.agencyName, booking.bookingId, flight, booking.totalPrice, ticketPath);
    }
    return updated;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[booking] ticket generation failed:', e.message);
    return booking;
  }
}

async function createForAgency(user, body) {
  validatePassengers(body.seatsBooked, body.passengers);
  const { booking, flight } = await reserveAndCreate({
    flightId: body.flightId,
    seatsBooked: body.seatsBooked,
    passengers: body.passengers,
    agencyId: user.id,
    status: 'pending',
    paymentStatus: 'pending',
  });

  const agency = await prisma.agency.findUnique({
    where: { id: user.id },
    select: { email: true, agencyName: true },
  });

  await audit.log({
    action: 'booking_created',
    userId: user.id,
    userRole: user.role,
    userEmail: user.email,
    bookingId: booking.id,
    flightId: flight.id,
    agencyId: user.id,
    details: { seatsBooked: booking.seatsBooked, totalPrice: Number(booking.totalPrice) },
  });

  const finalBooking = await attachTicket(booking, flight, agency);
  return { booking: finalBooking, ticketUrl: `/api/tickets/download/${booking.bookingId}` };
}

async function createForGuest(body) {
  validatePassengers(body.seatsBooked, body.passengers);
  if (!body.passengers[0]?.email) {
    throw ApiError.badRequest('Email is required for the first passenger to receive the e-ticket');
  }
  const { booking, flight } = await reserveAndCreate({
    flightId: body.flightId,
    seatsBooked: body.seatsBooked,
    passengers: body.passengers,
    agencyId: null,
    status: 'sold',
    paymentStatus: 'completed',
  });

  const guest = {
    email: body.passengers[0].email,
    agencyName: 'Guest Booking',
    contactPerson: body.passengers[0].name,
  };
  await attachTicket(booking, flight, guest);

  return {
    booking: {
      bookingId: booking.bookingId,
      flightNumber: flight.flightNumber,
      totalPrice: booking.totalPrice,
      status: booking.status,
    },
  };
}

const listForAgency = (agencyId) =>
  prisma.booking.findMany({ where: { agencyId }, include: FLIGHT_SELECT, orderBy: { createdAt: 'desc' } });

const listAll = () =>
  prisma.booking.findMany({
    include: { flight: true, agency: { select: { id: true, agencyName: true, email: true, city: true } } },
    orderBy: { createdAt: 'desc' },
  });

async function getByBookingId(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { bookingId },
    include: { flight: true, agency: { select: { id: true, agencyName: true, email: true, city: true } } },
  });
  if (!booking) throw ApiError.notFound('Booking not found');
  return booking;
}

async function updatePassengers(bookingId, user, passengers) {
  const booking = await prisma.booking.findUnique({ where: { bookingId } });
  if (!booking) throw ApiError.notFound('Booking not found');

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  if (!isAdmin && booking.agencyId !== user.id) throw ApiError.forbidden('Not authorized');
  if (booking.status === 'cancelled') throw ApiError.badRequest('Cannot update a cancelled booking');
  if (!isAdmin && Date.now() - new Date(booking.createdAt).getTime() > ONE_HOUR) {
    throw ApiError.badRequest('Update window expired. Bookings can only be updated within 1 hour of booking.');
  }

  const updated = await prisma.booking.update({ where: { id: booking.id }, data: { passengers } });
  await audit.log({
    action: 'booking_updated',
    userId: user.id,
    userRole: user.role,
    userEmail: user.email,
    bookingId: booking.id,
    details: { updated: true },
  });
  return updated;
}

async function confirm(bookingId, user) {
  const booking = await prisma.booking.findUnique({ where: { bookingId } });
  if (!booking) throw ApiError.notFound('Booking not found');
  if (booking.status !== 'pending') throw ApiError.badRequest('Only bookings in pending status can be confirmed');

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'sold', paymentStatus: 'completed' },
  });
  await audit.log({
    action: 'booking_confirmed',
    userId: user.id,
    userRole: user.role,
    userEmail: user.email,
    bookingId: booking.id,
    details: { confirmed: true },
  });
  return updated;
}

async function cancel(bookingId, user, reason) {
  const booking = await prisma.booking.findUnique({ where: { bookingId } });
  if (!booking) throw ApiError.notFound('Booking not found');

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  if (!isAdmin && booking.agencyId !== user.id) {
    throw ApiError.forbidden('You are not authorized to cancel this booking');
  }
  if (booking.status === 'cancelled') throw ApiError.badRequest('Booking is already cancelled');
  if (booking.status === 'sold') throw ApiError.badRequest('Cannot cancel a sold ticket');
  if (!isAdmin && Date.now() - new Date(booking.createdAt).getTime() > ONE_HOUR) {
    throw ApiError.badRequest('Cancellation window expired. Bookings can only be cancelled within 1 hour of booking.');
  }

  // Free the seats and cancel atomically.
  const updated = await prisma.$transaction(async (tx) => {
    await tx.flight.update({
      where: { id: booking.flightId },
      data: { seatsBooked: { decrement: booking.seatsBooked }, seatsRemaining: { increment: booking.seatsBooked } },
    });
    return tx.booking.update({
      where: { id: booking.id },
      data: { status: 'cancelled', cancellationReason: reason || null, cancelledBy: user.role, cancelledAt: new Date() },
    });
  });

  await audit.log({
    action: 'booking_cancelled',
    userId: user.id,
    userRole: user.role,
    userEmail: user.email,
    bookingId: booking.id,
    flightId: booking.flightId,
    details: { seatsFreed: booking.seatsBooked, reason: reason || 'No reason provided' },
  });
  return updated;
}

module.exports = {
  createForAgency,
  createForGuest,
  listForAgency,
  listAll,
  getByBookingId,
  updatePassengers,
  confirm,
  cancel,
};
