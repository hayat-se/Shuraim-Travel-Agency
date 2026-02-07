const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Admin Dashboard - Get statistics
router.get('/admin/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { Booking, Flight, Agency } = db;

    const totalFlights = await Flight.count({ where: { status: 'active' } });
    const totalAgencies = await Agency.count({ where: { status: 'approved' } });
    const pendingAgencies = await Agency.count({ where: { status: 'pending' } });

    // Get ticket counts by status
    const soldTickets = await Booking.count({ where: { status: 'sold' } });
    const holdTickets = await Booking.count({ where: { status: { [Op.in]: ['hold', 'cancel_requested'] } } });
    const canceledTickets = await Booking.count({ where: { status: 'cancelled' } });

    const totalBookings = await Booking.count();
    const totalRevenue = await Booking.sum('totalPrice', { where: { status: { [Op.ne]: 'cancelled' } } }) || 0;

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
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Agency Dashboard - Get statistics
router.get('/agency/stats', authMiddleware, async (req, res) => {
  try {
    const { Booking, Agency } = db;

    const soldTickets = await Booking.count({
      where: { agencyId: req.user.id, status: 'sold' }
    });
    const holdTickets = await Booking.count({
      where: { agencyId: req.user.id, status: { [Op.in]: ['hold', 'cancel_requested'] } }
    });
    const cancelledTickets = await Booking.count({
      where: { agencyId: req.user.id, status: 'cancelled' }
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
    console.error('Agency stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
