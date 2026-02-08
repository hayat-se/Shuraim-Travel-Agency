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
      const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
      const stream = fs.createWriteStream(ticketPath);

      doc.pipe(stream);

      // ─── Resolve airline logo (BLOB or file) ───
      let logoImageSource = null;
      try {
        const { Airline } = require('../config/database');
        if (Airline) {
          const airline = await Airline.findOne({ where: { name: flight.airlineName } });
          if (airline && airline.logoData) {
            logoImageSource = airline.logoData;
          } else if (airline && airline.logoUrl) {
            const absPath = path.join(__dirname, '..', 'public', airline.logoUrl);
            if (fs.existsSync(absPath)) logoImageSource = absPath;
          }
        }
      } catch (e) {
        console.error('Airline logo lookup failed:', e.message);
      }
      if (!logoImageSource && airlineLogoPath && fs.existsSync(airlineLogoPath)) {
        logoImageSource = airlineLogoPath;
      }

      const pageWidth = doc.page.width - 80; // usable width with margins
      const rightEdge = doc.page.width - 40; // right margin edge

      // HEADER: Airline logo top right, E-Ticket Voucher left, PNR/date right
      const headerTop = doc.y;
      // Airline logo top right
      if (logoImageSource) {
        try {
          doc.image(logoImageSource, rightEdge - 100, headerTop, { width: 90, height: 50 });
        } catch (imgErr) {
          console.error('Error embedding airline logo:', imgErr.message);
        }
      }
      // E-Ticket Voucher heading
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#222').text('E-Ticket Voucher', 40, headerTop + 6);
      // PNR and Departure Date right
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0066cc').text(`PNR: ${flight.pnr || booking.bookingId.slice(-6).toUpperCase()}`, rightEdge - 180, headerTop + 10, { width: 170, align: 'right' });
      doc.fontSize(9).font('Helvetica').fillColor('#333').text(`Departure Date: ${new Date(flight.departureDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}`, rightEdge - 180, headerTop + 28, { width: 170, align: 'right' });
      doc.y = headerTop + 60;
      doc.moveTo(40, doc.y).lineTo(rightEdge, doc.y).lineWidth(1.5).strokeColor('#cccccc').stroke();
      doc.moveDown(0.5);

      // FLIGHT SEGMENT CARD (modern airline style)
      doc.moveDown(0.5);
      const segTop = doc.y;
      doc.rect(40, segTop, pageWidth, 60).fill('#fff');
      // Departure
      doc.fontSize(8).font('Helvetica').fillColor('#888').text('Sunday, ' + new Date(flight.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 50, segTop + 8);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#111').text(flight.departureTime, 50, segTop + 22);
      doc.fontSize(10).font('Helvetica').fillColor('#333').text(flight.departureCity, 50, segTop + 44);
      // Arrow and duration
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#0066cc').text('→', 180, segTop + 28);
      // Duration (if available)
      let duration = '';
      if (flight.departureTime && flight.arrivalTime) {
        const [dh, dm] = flight.departureTime.split(':').map(Number);
        const [ah, am] = flight.arrivalTime.split(':').map(Number);
        let mins = (ah * 60 + am) - (dh * 60 + dm);
        if (mins < 0) mins += 24 * 60;
        duration = `${Math.floor(mins / 60)}h ${('0' + (mins % 60)).slice(-2)}m`;
      }
      doc.fontSize(9).font('Helvetica').fillColor('#888').text(duration, 210, segTop + 32);
      // Arrival
      doc.fontSize(8).font('Helvetica').fillColor('#888').text('Sunday, ' + new Date(flight.arrivalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 320, segTop + 8);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#111').text(flight.arrivalTime, 320, segTop + 22);
      doc.fontSize(10).font('Helvetica').fillColor('#333').text(flight.destinationCity, 320, segTop + 44);
      // Flight/class/baggage
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#222').text('Economy', rightEdge - 100, segTop + 8);
      doc.fontSize(8).font('Helvetica').fillColor('#333').text('25+10KG', rightEdge - 100, segTop + 22);
      doc.fontSize(8).font('Helvetica').fillColor('#333').text('Buy on board', rightEdge - 100, segTop + 36);
      doc.y = segTop + 68;

      // RED WARNING BOX
      doc.moveDown(0.5);
      const warnY = doc.y;
      doc.rect(40, warnY, pageWidth, 32).fill('#fff');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#dc3545').text('Note: Tickets are non refundable, non changeable.', 45, warnY + 4);
      doc.fontSize(7).font('Helvetica').fillColor('#dc3545').text('Any penalty imposed on passengers by the airline, the concern agent will be held responsible.\nALWAYS RE-CONFIRM YOUR TICKET AND BAGGAGE FROM AIRLINE OR FROM US 03DAYS BEFORE THE FLIGHT OTHERWISE WE WILL NOT BE RESPONSIBLE FOR ANY LOSS.', 45, warnY + 14, { width: pageWidth - 10 });
      doc.y = warnY + 38;

      // PASSENGER DETAILS TABLE (modern airline style)
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#222').text('Passenger details', 40, doc.y);
      doc.fontSize(9).font('Helvetica').fillColor('#0066cc').text(`Departure Date: ${new Date(flight.departureDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}`, rightEdge - 180, doc.y, { width: 170, align: 'right' });
      doc.moveDown(0.5);
      // Table header
      const tableTop = doc.y;
      doc.rect(40, tableTop, pageWidth, 20).fill('#f5f5f5');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#333');
      doc.text('Passenger Name', 50, tableTop + 6);
      doc.text('Passport No', 200, tableTop + 6);
      doc.text('Ticket Number', 320, tableTop + 6);
      doc.text('Status', 440, tableTop + 6);
      // Table rows
      let rowY = tableTop + 20;
      const passengers = booking.passengers || [];
      passengers.forEach((p, i) => {
        const bgColor = i % 2 === 0 ? '#fff' : '#f9f9f9';
        doc.rect(40, rowY, pageWidth, 18).fill(bgColor);
        doc.fontSize(8).font('Helvetica').fillColor('#222');
        const fullName = p.givenName ? `${p.title || ''} ${p.givenName} ${p.surname || ''}`.trim() : (p.name || '');
        doc.text(fullName.toUpperCase(), 50, rowY + 5, { width: 140 });
        doc.text(p.passport || p.cnic || '-', 200, rowY + 5, { width: 100 });
        doc.text('—', 320, rowY + 5, { width: 100 });
        doc.font('Helvetica-Bold').fillColor('#28a745').text('CONFIRMED', 440, rowY + 5, { width: 100 });
        rowY += 18;
      });
      doc.moveTo(40, rowY).lineTo(rightEdge, rowY).lineWidth(0.5).strokeColor('#cccccc').stroke();
      doc.y = rowY + 8;

      // ════════════════════════════════════════════
      // FARE SUMMARY
      // ════════════════════════════════════════════
      const fareBoxTop = doc.y;
      doc.rect(40, fareBoxTop, pageWidth, 50).fill('#f9f9f9');
      doc.rect(40, fareBoxTop, pageWidth, 50).lineWidth(0.5).strokeColor('#dddddd').stroke();

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0066cc').text('FARE DETAILS', 55, fareBoxTop + 6);

      doc.fontSize(8).font('Helvetica').fillColor('#333333');
      doc.text('Price per Seat:', 55, fareBoxTop + 20);
      doc.text(`PKR ${Number(flight.pricePerSeat).toLocaleString()}`, 160, fareBoxTop + 20);
      doc.text('Seats Booked:', 55, fareBoxTop + 33);
      doc.text(`${booking.seatsBooked}`, 160, fareBoxTop + 33);

      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0066cc');
      doc.text(`TOTAL: PKR ${Number(booking.totalPrice).toLocaleString()}`, 350, fareBoxTop + 22, { width: pageWidth - 320, align: 'right' });

      doc.y = fareBoxTop + 58;

      // ════════════════════════════════════════════
      // QR CODE + STATUS (compact, side by side)
      // ════════════════════════════════════════════
      const qrSectionY = doc.y;
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(booking.bookingId);
        const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
        doc.image(qrBuffer, 55, qrSectionY, { width: 65 });
      } catch (qrError) {
        console.error('QR Code generation error:', qrError);
      }

      doc.fontSize(7).font('Helvetica').fillColor('#666666').text('Scan to verify', 55, qrSectionY + 67, { width: 65, align: 'center' });

      doc.fontSize(8).font('Helvetica-Bold').fillColor('#333333').text('BOOKING STATUS', 170, qrSectionY + 8);
      const statusText = (booking.status || 'hold').toUpperCase();
      const statusColor = booking.status === 'sold' ? '#28a745' : booking.status === 'cancelled' ? '#dc3545' : '#ffc107';
      doc.fontSize(12).font('Helvetica-Bold').fillColor(statusColor).text(statusText, 170, qrSectionY + 22);

      doc.fontSize(7).font('Helvetica').fillColor('#666666');
      doc.text(`Booking Date: ${new Date(booking.createdAt).toLocaleDateString('en-GB')}`, 170, qrSectionY + 42);
      doc.text(`Payment: ${(booking.paymentStatus || 'pending').toUpperCase()}`, 170, qrSectionY + 54);

      doc.y = qrSectionY + 82;

      // ════════════════════════════════════════════
      // TERMS & CONDITIONS
      // ════════════════════════════════════════════
      doc.moveTo(40, doc.y).lineTo(rightEdge, doc.y).lineWidth(0.5).strokeColor('#dddddd').stroke();
      doc.moveDown(0.3);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333').text('TERMS & CONDITIONS', 40);
      doc.moveDown(0.15);
      doc.fontSize(6).font('Helvetica').fillColor('#666666');
      doc.text('1.  This e-ticket is valid only for the specified flight and is non-transferable.', 40, doc.y, { width: pageWidth, indent: 0 });
      doc.text('2.  Passengers must present valid passport/ID documents at the airport.', { width: pageWidth });
      doc.text('3.  Check-in opens 3 hours before departure for international flights.', { width: pageWidth });
      doc.text('4.  Baggage allowance applies as per airline policy.', { width: pageWidth });
      doc.text('5.  For cancellations and modifications, contact your booking agency.', { width: pageWidth });

      // ════════════════════════════════════════════
      // FOOTER
      // ════════════════════════════════════════════
      const footerY = doc.page.height - 45;
      doc.moveTo(40, footerY).lineTo(rightEdge, footerY).lineWidth(1).strokeColor('#0066cc').stroke();
      doc.fontSize(6.5).font('Helvetica').fillColor('#666666');
      doc.text('Shuraim Air Travel & Tours  |  shuraimintl@gmail.com', 40, footerY + 6, { width: pageWidth, align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString('en-GB')}  |  © ${new Date().getFullYear()} Shuraim Air Travel & Tours`, 40, footerY + 16, { width: pageWidth, align: 'center' });

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
