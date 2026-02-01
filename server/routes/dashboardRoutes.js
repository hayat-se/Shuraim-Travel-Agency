const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Agency = require('../models/Agency');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Admin Dashboard - Get statistics
router.get('/admin/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalFlights = await Flight.count({ where: { status: 'active' } });
    const totalAgencies = await Agency.count({ where: { status: 'approved' } });
    const pendingAgencies = await Agency.count({ where: { status: 'pending' } });
    
    // Get ticket counts by status
    const soldTickets = await Booking.count({ where: { status: { [Op.in]: ['sold', 'completed'] } } });
    const holdTickets = await Booking.count({ where: { status: { [Op.in]: ['hold', 'confirmed', 'cancel_requested'] } } });
    const canceledTickets = await Booking.count({ where: { status: { [Op.in]: ['cancelled', 'canceled'] } } });

    const totalBookings = await Booking.count();
    const totalRevenue = await Booking.sum('totalPrice') || 0;

    res.status(200).json({
      totalFlights,
      soldTickets,
      holdTickets,
      canceledTickets,
      totalAgencies,
      pendingAgencies,
      totalBookings,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agency Dashboard - Get statistics
router.get('/agency/stats', authMiddleware, async (req, res) => {
  try {
    // Get ticket counts by status
    const soldTickets = await Booking.count({
      where: { agencyId: req.user.id, status: { [Op.in]: ['sold', 'completed'] } }
    });
    const holdTickets = await Booking.count({
      where: { agencyId: req.user.id, status: { [Op.in]: ['hold', 'confirmed', 'cancel_requested'] } }
    });
    const cancelledTickets = await Booking.count({
      where: { agencyId: req.user.id, status: { [Op.in]: ['cancelled', 'canceled'] } }
    });

    const agency = await Agency.findByPk(req.user.id);

    res.status(200).json({
      soldTickets,
      holdTickets,
      cancelledTickets,
      agencyName: agency?.agencyName || '',
      city: agency?.city || ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get booking statistics by route
router.get('/admin/bookings-by-route', authMiddleware, adminOnly, async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $lookup: {
          from: 'flights',
          localField: 'flight',
          foreignField: '_id',
          as: 'flightData'
        }
      },
      { $unwind: '$flightData' },
      {
        $group: {
          _id: {
            from: '$flightData.departureCity',
            to: '$flightData.destinationCity'
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
