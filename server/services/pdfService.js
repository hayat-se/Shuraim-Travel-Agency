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

      // ════════════════════════════════════════════
      // HEADER — Airline Logo + Name + E-Ticket tag
      // ════════════════════════════════════════════
      const headerTop = doc.y;

      if (logoImageSource) {
        try {
          doc.image(logoImageSource, 40, headerTop, { width: 60, height: 40 });
        } catch (imgErr) {
          console.error('Error embedding airline logo:', imgErr.message);
        }
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000').text(flight.airlineName, 110, headerTop + 2, { width: 250 });
        doc.fontSize(9).font('Helvetica').fillColor('#555555').text('Electronic Ticket / E-Ticket', 110, headerTop + 25, { width: 250 });
      } else {
        doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000').text(flight.airlineName, 40, headerTop, { width: 300 });
        doc.fontSize(9).font('Helvetica').fillColor('#555555').text('Electronic Ticket / E-Ticket', 40, headerTop + 25, { width: 300 });
      }

      // Booking ID badge (right-aligned)
      const refX = 390;
      const refW = rightEdge - refX;
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#0066cc').text('BOOKING REF', refX, headerTop, { width: refW, align: 'right' });
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text(booking.bookingId, refX, headerTop + 13, { width: refW, align: 'right' });
      doc.fontSize(7).font('Helvetica').fillColor('#666666').text(`Date: ${new Date().toLocaleDateString('en-GB')}`, refX, headerTop + 27, { width: refW, align: 'right' });

      doc.y = headerTop + 48;
      doc.moveTo(40, doc.y).lineTo(rightEdge, doc.y).lineWidth(2).strokeColor('#0066cc').stroke();
      doc.moveDown(0.5);

      // ════════════════════════════════════════════
      // FLIGHT INFORMATION — Route card
      // ════════════════════════════════════════════
      const flightBoxTop = doc.y;
      doc.rect(40, flightBoxTop, pageWidth, 70).fill('#f0f6ff');

      // Left: Departure
      doc.fontSize(8).font('Helvetica').fillColor('#666666').text('DEPARTURE', 55, flightBoxTop + 6);
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text(flight.departureCity, 55, flightBoxTop + 18, { width: 170 });
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(
        new Date(flight.departureDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
        55, flightBoxTop + 38
      );
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0066cc').text(flight.departureTime, 55, flightBoxTop + 52);

      // Center: Arrow + flight info
      doc.fontSize(16).font('Helvetica').fillColor('#999999').text('✈', 260, flightBoxTop + 16, { width: 40, align: 'center' });
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#0066cc').text(flight.flightNumber, 248, flightBoxTop + 38, { width: 64, align: 'center' });
      doc.fontSize(7).font('Helvetica').fillColor('#666666').text(flight.flightClass.toUpperCase(), 248, flightBoxTop + 50, { width: 64, align: 'center' });

      // Right: Arrival
      doc.fontSize(8).font('Helvetica').fillColor('#666666').text('ARRIVAL', 380, flightBoxTop + 6);
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text(flight.destinationCity, 380, flightBoxTop + 18, { width: 170 });
      doc.fontSize(9).font('Helvetica').fillColor('#333333').text(
        new Date(flight.arrivalDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
        380, flightBoxTop + 38
      );
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0066cc').text(flight.arrivalTime, 380, flightBoxTop + 52);

      doc.y = flightBoxTop + 76;

      // ════════════════════════════════════════════
      // AGENCY DETAILS (small bar)
      // ════════════════════════════════════════════
      doc.rect(40, doc.y, pageWidth, 18).fill('#e8e8e8');
      const agencyBarY = doc.y + 4;
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333').text('AGENCY:', 55, agencyBarY);
      doc.fontSize(7).font('Helvetica').fillColor('#333333').text(
        `${agency.agencyName}  |  ${agency.contactPerson}  |  ${agency.phone || ''}`,
        95, agencyBarY, { width: 440 }
      );
      doc.y += 24;

      // ════════════════════════════════════════════
      // PASSENGER DETAILS TABLE
      // ════════════════════════════════════════════
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0066cc').text('PASSENGER DETAILS');
      doc.moveDown(0.2);

      // Table header
      const tableTop = doc.y;
      const colX = { no: 42, title: 62, name: 105, passport: 280, dob: 380, doe: 470 };
      doc.rect(40, tableTop, pageWidth, 16).fill('#0066cc');
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff');
      doc.text('#', colX.no, tableTop + 4);
      doc.text('TITLE', colX.title, tableTop + 4);
      doc.text('PASSENGER NAME', colX.name, tableTop + 4);
      doc.text('PASSPORT #', colX.passport, tableTop + 4);
      doc.text('DOB', colX.dob, tableTop + 4);
      doc.text('DOE', colX.doe, tableTop + 4);

      let rowY = tableTop + 18;
      const passengers = booking.passengers || [];
      passengers.forEach((p, i) => {
        const bgColor = i % 2 === 0 ? '#f9f9f9' : '#ffffff';
        doc.rect(40, rowY, pageWidth, 16).fill(bgColor);

        doc.fontSize(7).font('Helvetica').fillColor('#333333');
        doc.text(`${i + 1}`, colX.no, rowY + 4);
        doc.text(p.title || 'MR.', colX.title, rowY + 4);
        const fullName = p.givenName ? `${p.givenName} ${p.surname || ''}`.trim() : (p.name || '');
        doc.text(fullName.toUpperCase(), colX.name, rowY + 4, { width: 170 });
        doc.text(p.passport || p.cnic || '-', colX.passport, rowY + 4);
        doc.text(p.dob ? new Date(p.dob).toLocaleDateString('en-GB') : '-', colX.dob, rowY + 4);
        doc.text(p.doe ? new Date(p.doe).toLocaleDateString('en-GB') : '-', colX.doe, rowY + 4);
        rowY += 16;
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
