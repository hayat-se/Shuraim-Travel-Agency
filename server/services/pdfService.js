const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const generateETicket = async (booking, flight, agency, airlineLogoPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create tickets directory if it doesn't exist
      const ticketsDir = path.join(__dirname, '../public/tickets');
      if (!fs.existsSync(ticketsDir)) {
        fs.mkdirSync(ticketsDir, { recursive: true });
      }

      const ticketPath = path.join(ticketsDir, `ticket-${booking.bookingId}.pdf`);
      const doc = new PDFDocument({ margin: 40, bufferPages: true });
      const stream = fs.createWriteStream(ticketPath);

      doc.pipe(stream);

      // Airline Logo + Header
      const headerY = doc.y;
      if (airlineLogoPath && fs.existsSync(airlineLogoPath)) {
        try {
          doc.image(airlineLogoPath, 40, headerY, { width: 80, height: 50 });
        } catch (imgErr) {
          console.error('Error embedding airline logo:', imgErr.message);
        }
        doc.fontSize(20).font('Helvetica-Bold').text(flight.airlineName, 130, headerY + 5, { width: 380 });
        doc.fontSize(11).text('Electronic Ticket (E-Ticket)', 130, headerY + 30, { width: 380 });
        doc.y = headerY + 60;
      } else {
        doc.fontSize(24).font('Helvetica-Bold').text(flight.airlineName, { align: 'center' });
        doc.fontSize(12).text('Electronic Ticket (E-Ticket)', { align: 'center' });
      }
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Booking and Agency Info
      doc.fontSize(11).font('Helvetica-Bold').text('BOOKING DETAILS', { underline: true });
      doc.fontSize(10).font('Helvetica');
      doc.text(`Booking ID: ${booking.bookingId}`);
      doc.text(`Agency: ${agency.agencyName}`);
      doc.text(`Contact: ${agency.contactPerson} | ${agency.phone}`);
      doc.moveDown(0.5);

      // Flight Details
      doc.fontSize(11).font('Helvetica-Bold').text('FLIGHT INFORMATION', { underline: true });
      doc.fontSize(10).font('Helvetica');
      doc.text(`Airline: ${flight.airlineName}`);
      doc.text(`Flight Number: ${flight.flightNumber}`);
      doc.text(`Class: ${flight.flightClass.toUpperCase()}`);
      doc.moveDown(0.3);

      // Route
      doc.fontSize(9).text('ROUTE', { underline: true });
      const y = doc.y;
      doc.text(`${flight.departureCity}`, 50, y);
      doc.fontSize(8).text('FROM', 50, y + 15);
      doc.text('→', 250, y + 5, { align: 'center' });
      doc.fontSize(10).text(`${flight.destinationCity}`, 400, y);
      doc.fontSize(8).text('TO', 420, y + 15);
      doc.moveDown(2);

      // Departure and Arrival Times
      doc.fontSize(9).text('DEPARTURE', { underline: true });
      doc.fontSize(10).text(`${new Date(flight.departureDate).toDateString()} at ${flight.departureTime}`);
      doc.moveDown(0.3);

      doc.fontSize(9).text('ARRIVAL', { underline: true });
      doc.fontSize(10).text(`${new Date(flight.arrivalDate).toDateString()} at ${flight.arrivalTime}`);
      doc.moveDown(0.5);

      // Passenger Details
      doc.fontSize(11).font('Helvetica-Bold').text('PASSENGERS (' + booking.passengers.length + ' seat(s))', { underline: true });
      doc.fontSize(9).font('Helvetica');
      
      booking.passengers.forEach((passenger, index) => {
        doc.text(`${index + 1}. ${passenger.name}`);
        doc.text(`   CNIC: ${passenger.cnic}`, { fontSize: 8 });
      });
      doc.moveDown(0.5);

      // Pricing
      doc.fontSize(11).font('Helvetica-Bold').text('FARE DETAILS', { underline: true });
      doc.fontSize(10).font('Helvetica');
      doc.text(`Price per Seat: PKR ${flight.pricePerSeat}`);
      doc.text(`Number of Seats: ${booking.seatsBooked}`);
      doc.fontSize(12).font('Helvetica-Bold').text(`TOTAL PRICE: PKR ${booking.totalPrice}`);
      doc.moveDown(1);

      // QR Code
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(booking.bookingId);
        const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
        doc.fontSize(9).text('BOOKING REFERENCE (QR Code)', { underline: true });
        doc.image(qrBuffer, 200, doc.y, { width: 100 });
      } catch (qrError) {
        console.error('QR Code generation error:', qrError);
      }
      doc.moveDown(4);

      // Terms and Conditions
      doc.fontSize(8).text('Terms & Conditions:', { underline: true });
      doc.fontSize(7).text(
        'This e-ticket is valid only for the specified flight and cannot be transferred. Passengers must present valid ID documents. ' +
        'For cancellations and modifications, please contact the agency. Baggage allowance and other policies apply as per the airline terms.',
        { width: 500, align: 'left' }
      );

      // Footer
      doc.moveTo(50, doc.page.height - 80).lineTo(550, doc.page.height - 80).stroke();
      doc.fontSize(8).text('For support, contact: support@airlineagency.com | +92-XXX-XXXXXXX', { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.text('© 2024 Airline Agency Management System', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(ticketPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateETicket };
