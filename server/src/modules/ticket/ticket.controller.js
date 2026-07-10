const fs = require('fs');
const path = require('path');
const prisma = require('../../config/prisma');
const ApiError = require('../../middleware/ApiError');
const { TICKETS_DIR } = require('../../services/pdfService');

exports.download = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await prisma.booking.findUnique({ where: { bookingId }, select: { ticketGenerated: true } });
  if (!booking) throw ApiError.notFound('Booking not found');
  if (!booking.ticketGenerated) {
    throw ApiError.badRequest('Ticket not yet generated. Please try again in a few moments.');
  }

  const ticketPath = path.join(TICKETS_DIR, `ticket-${bookingId}.pdf`);
  if (!fs.existsSync(ticketPath)) {
    throw ApiError.notFound('Ticket file not found on server. Please contact support.');
  }
  res.download(ticketPath, `ticket-${bookingId}.pdf`);
};

exports.details = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await prisma.booking.findUnique({
    where: { bookingId },
    include: { flight: true, agency: { select: { id: true, agencyName: true, email: true, city: true } } },
  });
  if (!booking) throw ApiError.notFound('Booking not found');

  res.json({
    bookingId: booking.bookingId,
    flight: booking.flight,
    agency: booking.agency,
    passengers: booking.passengers,
    seatsBooked: booking.seatsBooked,
    totalPrice: booking.totalPrice,
    status: booking.status,
    ticketGenerated: booking.ticketGenerated,
    createdAt: booking.createdAt,
  });
};
