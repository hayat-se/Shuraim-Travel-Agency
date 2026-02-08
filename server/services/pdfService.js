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

      // ════════════════════════════════════════════
      // HEADER — Airline Logo + Name + E-Ticket tag
      // ════════════════════════════════════════════
      const headerTop = doc.y;

      if (logoImageSource) {
        try {
          doc.image(logoImageSource, 40, headerTop, { width: 70, height: 45 });
        } catch (imgErr) {
          console.error('Error embedding airline logo:', imgErr.message);
        }
        doc.fontSize(22).font('Helvetica-Bold').text(flight.airlineName, 120, headerTop + 2, { width: 300 });
        doc.fontSize(10).font('Helvetica').fillColor('#555555').text('Electronic Ticket / E-Ticket', 120, headerTop + 28, { width: 300 });
      } else {
        doc.fontSize(22).font('Helvetica-Bold').text(flight.airlineName, 40, headerTop, { width: 350 });
        doc.fontSize(10).font('Helvetica').fillColor('#555555').text('Electronic Ticket / E-Ticket', 40, headerTop + 28, { width: 350 });
      }

      // Booking ID badge (right side)
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0066cc').text('BOOKING REF', 420, headerTop, { width: 140, align: 'right' });
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text(booking.bookingId, 420, headerTop + 14, { width: 140, align: 'right' });
      doc.fontSize(8).font('Helvetica').fillColor('#666666').text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 420, headerTop + 30, { width: 140, align: 'right' });

      doc.y = headerTop + 55;
      // Blue header line
      doc.moveTo(40, doc.y).lineTo(555, doc.y).lineWidth(2).strokeColor('#0066cc').stroke();
      doc.moveDown(0.8);

      // ════════════════════════════════════════════
      // FLIGHT INFORMATION — Route card
      // ════════════════════════════════════════════
      const flightBoxTop = doc.y;
      // Light blue background
      doc.rect(40, flightBoxTop, pageWidth, 80).fill('#f0f6ff');

      // Left: Departure
      doc.fontSize(9).font('Helvetica').fillColor('#666666').text('DEPARTURE', 55, flightBoxTop + 8);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text(flight.departureCity, 55, flightBoxTop + 22, { width: 180 });
      doc.fontSize(10).font('Helvetica').fillColor('#333333').text(
        `${new Date(flight.departureDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}`,
        55, flightBoxTop + 44
      );
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0066cc').text(flight.departureTime, 55, flightBoxTop + 60);

      // Center: Arrow + flight info
      doc.fontSize(18).font('Helvetica').fillColor('#999999').text('✈', 260, flightBoxTop + 20, { width: 40, align: 'center' });
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0066cc').text(flight.flightNumber, 245, flightBoxTop + 44, { width: 70, align: 'center' });
      doc.fontSize(8).font('Helvetica').fillColor('#666666').text(flight.flightClass.toUpperCase(), 245, flightBoxTop + 58, { width: 70, align: 'center' });

      // Right: Arrival
      doc.fontSize(9).font('Helvetica').fillColor('#666666').text('ARRIVAL', 380, flightBoxTop + 8);
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text(flight.destinationCity, 380, flightBoxTop + 22, { width: 180 });
      doc.fontSize(10).font('Helvetica').fillColor('#333333').text(
        `${new Date(flight.arrivalDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}`,
        380, flightBoxTop + 44
      );
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0066cc').text(flight.arrivalTime, 380, flightBoxTop + 60);

      doc.y = flightBoxTop + 90;

      // ════════════════════════════════════════════
      // AGENCY DETAILS (small bar)
      // ════════════════════════════════════════════
      doc.rect(40, doc.y, pageWidth, 22).fill('#e8e8e8');
      const agencyBarY = doc.y + 5;
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#333333').text('AGENCY:', 55, agencyBarY);
      doc.fontSize(8).font('Helvetica').fillColor('#333333').text(
        `${agency.agencyName}  |  ${agency.contactPerson}  |  ${agency.phone || ''}`,
        100, agencyBarY, { width: 430 }
      );
      doc.y += 30;

      // ════════════════════════════════════════════
      // PASSENGER DETAILS TABLE
      // ════════════════════════════════════════════
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#0066cc').text('PASSENGER DETAILS');
      doc.moveDown(0.3);

      // Table header
      const tableTop = doc.y;
      const colX = { no: 42, title: 62, name: 105, passport: 280, dob: 380, doe: 470 };
      doc.rect(40, tableTop, pageWidth, 20).fill('#0066cc');
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff');
      doc.text('#', colX.no, tableTop + 5);
      doc.text('TITLE', colX.title, tableTop + 5);
      doc.text('PASSENGER NAME', colX.name, tableTop + 5);
      doc.text('PASSPORT #', colX.passport, tableTop + 5);
      doc.text('DOB', colX.dob, tableTop + 5);
      doc.text('DOE', colX.doe, tableTop + 5);

      let rowY = tableTop + 22;
      const passengers = booking.passengers || [];
      passengers.forEach((p, i) => {
        const bgColor = i % 2 === 0 ? '#f9f9f9' : '#ffffff';
        doc.rect(40, rowY, pageWidth, 18).fill(bgColor);

        doc.fontSize(8).font('Helvetica').fillColor('#333333');
        doc.text(`${i + 1}`, colX.no, rowY + 4);
        doc.text(p.title || 'MR.', colX.title, rowY + 4);
        // Support both old (name) and new (givenName + surname) format
        const fullName = p.givenName ? `${p.givenName} ${p.surname || ''}`.trim() : (p.name || '');
        doc.text(fullName.toUpperCase(), colX.name, rowY + 4, { width: 170 });
        doc.text(p.passport || p.cnic || '-', colX.passport, rowY + 4);
        doc.text(p.dob ? new Date(p.dob).toLocaleDateString('en-GB') : '-', colX.dob, rowY + 4);
        doc.text(p.doe ? new Date(p.doe).toLocaleDateString('en-GB') : '-', colX.doe, rowY + 4);
        rowY += 18;
      });

      // Table bottom border
      doc.moveTo(40, rowY).lineTo(555, rowY).lineWidth(0.5).strokeColor('#cccccc').stroke();
      doc.y = rowY + 10;

      // ════════════════════════════════════════════
      // FARE SUMMARY
      // ════════════════════════════════════════════
      const fareBoxTop = doc.y;
      doc.rect(40, fareBoxTop, pageWidth, 60).fill('#f9f9f9');
      doc.rect(40, fareBoxTop, pageWidth, 60).lineWidth(0.5).strokeColor('#dddddd').stroke();

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#0066cc').text('FARE DETAILS', 55, fareBoxTop + 8);

      doc.fontSize(9).font('Helvetica').fillColor('#333333');
      doc.text(`Price per Seat:`, 55, fareBoxTop + 24);
      doc.text(`PKR ${Number(flight.pricePerSeat).toLocaleString()}`, 200, fareBoxTop + 24);

      doc.text(`Seats Booked:`, 55, fareBoxTop + 38);
      doc.text(`${booking.seatsBooked}`, 200, fareBoxTop + 38);

      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0066cc');
      doc.text(`TOTAL: PKR ${Number(booking.totalPrice).toLocaleString()}`, 350, fareBoxTop + 28, { width: 190, align: 'right' });

      doc.y = fareBoxTop + 70;

      // ════════════════════════════════════════════
      // QR CODE + STATUS
      // ════════════════════════════════════════════
      const qrSectionY = doc.y;
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(booking.bookingId);
        const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
        doc.image(qrBuffer, 55, qrSectionY, { width: 80 });
      } catch (qrError) {
        console.error('QR Code generation error:', qrError);
      }

      doc.fontSize(8).font('Helvetica').fillColor('#666666').text('Scan for booking verification', 50, qrSectionY + 83, { width: 90, align: 'center' });

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333').text('BOOKING STATUS', 200, qrSectionY + 10);
      const statusText = (booking.status || 'hold').toUpperCase();
      const statusColor = booking.status === 'sold' ? '#28a745' : booking.status === 'cancelled' ? '#dc3545' : '#ffc107';
      doc.fontSize(14).font('Helvetica-Bold').fillColor(statusColor).text(statusText, 200, qrSectionY + 26);

      doc.fontSize(8).font('Helvetica').fillColor('#666666');
      doc.text(`Booking Date: ${new Date(booking.createdAt).toLocaleDateString('en-GB')}`, 200, qrSectionY + 50);
      doc.text(`Payment Status: ${(booking.paymentStatus || 'pending').toUpperCase()}`, 200, qrSectionY + 64);

      doc.y = qrSectionY + 100;

      // ════════════════════════════════════════════
      // TERMS & CONDITIONS
      // ════════════════════════════════════════════
      doc.moveTo(40, doc.y).lineTo(555, doc.y).lineWidth(0.5).strokeColor('#dddddd').stroke();
      doc.moveDown(0.4);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333').text('TERMS & CONDITIONS');
      doc.fontSize(6.5).font('Helvetica').fillColor('#666666').text(
        '1. This e-ticket is valid only for the specified flight and is non-transferable.  ' +
        '2. Passengers must present valid passport/ID documents at the airport.  ' +
        '3. Check-in opens 3 hours before departure for international flights.  ' +
        '4. Baggage allowance applies as per airline policy.  ' +
        '5. For cancellations and modifications, contact your booking agency.',
        { width: pageWidth, lineGap: 1 }
      );
      doc.moveDown(0.5);

      // ════════════════════════════════════════════
      // FOOTER
      // ════════════════════════════════════════════
      const footerY = doc.page.height - 50;
      doc.moveTo(40, footerY).lineTo(555, footerY).lineWidth(1).strokeColor('#0066cc').stroke();
      doc.fontSize(7).font('Helvetica').fillColor('#666666');
      doc.text('Shuraim Air Travel & Tours  |  shuraimintl@gmail.com', 40, footerY + 8, { width: pageWidth, align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString('en-GB')}  |  © ${new Date().getFullYear()} Shuraim Air Travel & Tours`, 40, footerY + 20, { width: pageWidth, align: 'center' });

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
