const { Booking } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Download e-ticket PDF
const downloadTicket = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const booking = await Booking.findOne({ where: { bookingId } });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.ticketGenerated) {
      return res.status(400).json({ error: 'Ticket not yet generated. Please try again in a few moments.' });
    }

    const ticketPath = path.join(__dirname, '../public/tickets', `ticket-${bookingId}.pdf`);
    
    if (!fs.existsSync(ticketPath)) {
      return res.status(404).json({ error: 'Ticket file not found on server. Please contact support.' });
    }

    res.download(ticketPath, `ticket-${bookingId}.pdf`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error downloading ticket' });
        }
      }
    });
  } catch (error) {
    console.error('Download ticket error:', error);
    res.status(500).json({ error: error.message || 'Server error downloading ticket' });
  }
};

// Get ticket details
const getTicketDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      where: { bookingId },
      include: [
        { model: require('../config/database').Flight, as: 'flight' },
        { model: require('../config/database').Agency, as: 'agency' }
      ]
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({
      bookingId: booking.bookingId,
      flight: booking.flight,
      agency: booking.agency,
      passengers: booking.passengers,
      seatsBooked: booking.seatsBooked,
      totalPrice: booking.totalPrice,
      status: booking.status,
      ticketGenerated: booking.ticketGenerated,
      createdAt: booking.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  downloadTicket,
  getTicketDetails
};
