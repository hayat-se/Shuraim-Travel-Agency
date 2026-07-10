const prisma = require('../../config/prisma');
const ApiError = require('../../middleware/ApiError');

// Store only the group code (e.g. 'MCT DXB' -> 'MCT').
const normalizeGroup = (group) => {
  let code = group || 'ALL';
  if (typeof code === 'string' && code.includes(' ')) code = code.split(' ')[0];
  return code;
};

async function create(data, adminId) {
  const existing = await prisma.flight.findUnique({ where: { flightNumber: data.flightNumber } });
  if (existing) throw ApiError.badRequest('Flight number already exists');

  const total = parseInt(data.totalSeatsAvailable, 10);
  return prisma.flight.create({
    data: {
      airlineName: data.airlineName,
      flightNumber: data.flightNumber,
      departureCity: data.departureCity,
      destinationCity: data.destinationCity,
      departureDate: new Date(data.departureDate),
      departureTime: data.departureTime,
      arrivalDate: new Date(data.arrivalDate),
      arrivalTime: data.arrivalTime,
      flightClass: data.flightClass,
      group: normalizeGroup(data.group),
      meal: data.meal || 'No Meal',
      baggage: data.baggage || '20kg',
      totalSeatsAvailable: total,
      seatsRemaining: total,
      pricePerSeat: data.pricePerSeat,
      createdBy: adminId,
    },
  });
}

const listActive = () =>
  prisma.flight.findMany({ where: { status: 'active' }, orderBy: { departureDate: 'asc' } });

async function getById(id) {
  const flight = await prisma.flight.findUnique({ where: { id } });
  if (!flight) throw ApiError.notFound('Flight not found');
  return flight;
}

function search(query) {
  const where = { status: 'active' };
  if (query.departureCity) where.departureCity = { contains: query.departureCity, mode: 'insensitive' };
  if (query.destinationCity) where.destinationCity = { contains: query.destinationCity, mode: 'insensitive' };
  if (query.flightClass) where.flightClass = query.flightClass;
  if (query.group) where.group = query.group;
  if (query.departureDate) {
    where.departureDate = {
      gte: new Date(query.departureDate + 'T00:00:00.000Z'),
      lte: new Date(query.departureDate + 'T23:59:59.999Z'),
    };
  }
  if (query.minPrice || query.maxPrice) {
    where.pricePerSeat = {};
    if (query.minPrice) where.pricePerSeat.gte = Number(query.minPrice);
    if (query.maxPrice) where.pricePerSeat.lte = Number(query.maxPrice);
  }
  return prisma.flight.findMany({ where, orderBy: { departureDate: 'asc' } });
}

async function update(id, updates) {
  await getById(id);
  const data = { ...updates };
  delete data.id;
  if (data.group) data.group = normalizeGroup(data.group);
  if (data.departureDate) data.departureDate = new Date(data.departureDate);
  if (data.arrivalDate) data.arrivalDate = new Date(data.arrivalDate);
  return prisma.flight.update({ where: { id }, data });
}

async function cancel(id) {
  await getById(id);
  return prisma.flight.update({ where: { id }, data: { status: 'cancelled' } });
}

async function remove(id) {
  const flight = await getById(id);
  if (flight.seatsBooked > 0) {
    throw ApiError.badRequest('Cannot delete flight with existing bookings. Cancel the flight instead.');
  }
  await prisma.flight.delete({ where: { id } });
}

async function availability(id) {
  const f = await getById(id);
  return {
    flightNumber: f.flightNumber,
    totalSeats: f.totalSeatsAvailable,
    seatsBooked: f.seatsBooked,
    seatsRemaining: f.seatsRemaining,
    occupancyRate: ((f.seatsBooked / f.totalSeatsAvailable) * 100).toFixed(2),
  };
}

module.exports = { create, listActive, getById, search, update, cancel, remove, availability };
