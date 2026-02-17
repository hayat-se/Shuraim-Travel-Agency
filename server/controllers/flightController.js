const { Flight, AuditLog } = require('../config/database');
const { Op } = require('sequelize');

// Create flight (Admin only)
const createFlight = async (req, res) => {
  try {
    const {
      airlineName,
      flightNumber,
      departureCity,
      destinationCity,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      flightClass,
      group,
      meal,
      baggage,
      totalSeatsAvailable,
      pricePerSeat
    } = req.body;

    // Check if flight number already exists
    const existingFlight = await Flight.findOne({ where: { flightNumber } });
    if (existingFlight) {
      return res.status(400).json({ error: 'Flight number already exists' });
    }

    // Only store group code (e.g., 'MCT')
    let groupCode = group || 'ALL';
    if (typeof groupCode === 'string' && groupCode.includes(' ')) {
      groupCode = groupCode.split(' ')[0];
    }
    const newFlight = await Flight.create({
      airlineName,
      flightNumber,
      departureCity,
      destinationCity,
      departureDate: new Date(departureDate),
      departureTime,
      arrivalDate: new Date(arrivalDate),
      arrivalTime,
      flightClass,
      group: groupCode,
      meal: meal || 'No Meal',
      baggage: baggage || '20kg',
      totalSeatsAvailable,
      seatsRemaining: totalSeatsAvailable,
      pricePerSeat,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: 'Flight created successfully',
      flight: newFlight
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all flights
const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.findAll({
      where: { status: 'active' },
      order: [['departureDate', 'ASC']]
    });
    res.status(200).json(flights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get flight by ID
const getFlightById = async (req, res) => {
  try {
    const { flightId } = req.params;
    const flight = await Flight.findByPk(flightId);

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.status(200).json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search flights
const searchFlights = async (req, res) => {
  try {
    const { departureCity, destinationCity, departureDate, flightClass, minPrice, maxPrice, group } = req.query;

    const where = { status: 'active' };

    if (departureCity) where.departureCity = { [Op.like]: `%${departureCity}%` };
    if (destinationCity) where.destinationCity = { [Op.like]: `%${destinationCity}%` };
    if (flightClass) where.flightClass = flightClass;
    if (group) where.group = group;
    
    if (departureDate) {
      const startOfDay = new Date(departureDate + 'T00:00:00.000Z');
      const endOfDay = new Date(departureDate + 'T23:59:59.999Z');
      where.departureDate = { [Op.between]: [startOfDay, endOfDay] };
    }
    
    if (minPrice || maxPrice) {
      where.pricePerSeat = {};
      if (minPrice) where.pricePerSeat[Op.gte] = minPrice;
      if (maxPrice) where.pricePerSeat[Op.lte] = maxPrice;
    }

    const flights = await Flight.findAll({
      where,
      order: [['departureDate', 'ASC']]
    });
    res.status(200).json(flights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update flight (Admin only)
const updateFlight = async (req, res) => {
  try {
    const { flightId } = req.params;
    const updates = req.body;

    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Only store group code (e.g., 'MCT') on update
    if (updates.group && typeof updates.group === 'string' && updates.group.includes(' ')) {
      updates.group = updates.group.split(' ')[0];
    }
    await flight.update(updates);

    res.status(200).json({
      message: 'Flight updated successfully',
      flight: flight
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel flight (Admin only)
const cancelFlight = async (req, res) => {
  try {
    const { flightId } = req.params;

    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    await flight.update({ status: 'cancelled' });

    res.status(200).json({
      message: 'Flight cancelled successfully',
      flight: flight
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete flight permanently (Admin only)
const deleteFlight = async (req, res) => {
  try {
    const { flightId } = req.params;

    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Check if flight has any bookings
    if (flight.seatsBooked > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete flight with existing bookings. Cancel the flight instead.' 
      });
    }

    await flight.destroy();

    res.status(200).json({
      message: 'Flight deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get seat availability
const getSeatAvailability = async (req, res) => {
  try {
    const { flightId } = req.params;

    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.status(200).json({
      flightNumber: flight.flightNumber,
      totalSeats: flight.totalSeatsAvailable,
      seatsBooked: flight.seatsBooked,
      seatsRemaining: flight.seatsRemaining,
      occupancyRate: ((flight.seatsBooked / flight.totalSeatsAvailable) * 100).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFlight,
  getAllFlights,
  getFlightById,
  searchFlights,
  updateFlight,
  cancelFlight,
  deleteFlight,
  getSeatAvailability
};
