const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const prisma = require('../config/prisma');

const TICKETS_DIR = path.join(__dirname, '..', '..', 'public', 'tickets');

// Palette
const INK = '#0B2447';
const ACCENT = '#1A56B0';
const MUTE = '#6b7280';
const LINE = '#d7dde5';
const DANGER = '#c0392b';

/**
 * Resolve the airline logo image source (Buffer from DB BLOB, or an on-disk path).
 */
async function resolveLogo(airlineName, airlineLogoPath) {
  try {
    const airline = await prisma.airline.findUnique({
      where: { name: airlineName },
      select: { logoData: true, logoUrl: true },
    });
    if (airline?.logoData) return Buffer.from(airline.logoData);
    if (airline?.logoUrl) {
      const absPath = path.join(__dirname, '..', '..', 'public', airline.logoUrl);
      if (fs.existsSync(absPath)) return absPath;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[pdf] Airline logo lookup failed:', e.message);
  }
  if (airlineLogoPath && fs.existsSync(airlineLogoPath)) return airlineLogoPath;
  return null;
}

const dateLong = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const statusLabel = (status) => {
  if (status === 'sold') return { text: 'CONFIRMED', color: '#1a8f4c' };
  if (status === 'cancelled') return { text: 'CANCELLED', color: DANGER };
  if (status === 'hold' || status === 'cancel_requested') return { text: 'HOLD', color: '#b7791f' };
  return { text: (status || 'PENDING').toUpperCase(), color: '#b7791f' };
};

/**
 * Build the ordered list of flight segments (leg 1 always; leg 2 for connecting/two-way).
 */
function buildSegments(flight) {
  const segments = [
    {
      airlineName: flight.airlineName,
      flightNumber: flight.flightNumber,
      departureCity: flight.departureCity,
      destinationCity: flight.destinationCity,
      departureDate: flight.departureDate,
      departureTime: flight.departureTime,
      arrivalDate: flight.arrivalDate,
      arrivalTime: flight.arrivalTime,
      baggage: flight.baggage,
    },
  ];
  if (flight.flightType && flight.flightType !== 'direct' && flight.secondLeg) {
    const s = typeof flight.secondLeg === 'string' ? JSON.parse(flight.secondLeg) : flight.secondLeg;
    if (s && (s.departureCity || s.flightNumber)) {
      segments.push({
        airlineName: s.airlineName || flight.airlineName,
        flightNumber: s.flightNumber,
        departureCity: s.departureCity,
        destinationCity: s.destinationCity,
        departureDate: s.departureDate,
        departureTime: s.departureTime,
        arrivalDate: s.arrivalDate,
        arrivalTime: s.arrivalTime,
        baggage: s.baggage || flight.baggage,
      });
    }
  }
  return segments;
}

/**
 * Generate an e-ticket PDF to disk and resolve with its absolute path.
 * Saudia-style itinerary: booking-agency details + passengers + one block per
 * flight segment. Intentionally NO fare, NO seat count, NO Shuraim (admin) identity.
 */
async function generateETicket(booking, flight, agency, airlineLogoPath) {
  if (!fs.existsSync(TICKETS_DIR)) fs.mkdirSync(TICKETS_DIR, { recursive: true });

  const ticketPath = path.join(TICKETS_DIR, `ticket-${booking.bookingId}.pdf`);
  const logoImageSource = await resolveLogo(flight.airlineName, airlineLogoPath);

  // Pre-render the QR (barcode substitute) so the drawing pass stays synchronous.
  let qrBuffer = null;
  try {
    const qrDataUrl = await QRCode.toDataURL(booking.bookingId, { margin: 0 });
    qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  } catch (e) {
    /* QR optional */
  }

  const ref = flight.pnr || booking.bookingId.slice(-6).toUpperCase();
  const segments = buildSegments(flight);
  const passengers = Array.isArray(booking.passengers) ? booking.passengers : [];
  const st = statusLabel(booking.status);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const stream = fs.createWriteStream(ticketPath);
      doc.pipe(stream);

      const left = 40;
      const right = doc.page.width - 40;
      const width = right - left;

      // ── HEADER ────────────────────────────────────────────────
      const headerTop = 40;
      if (qrBuffer) {
        try { doc.image(qrBuffer, left, headerTop, { width: 54, height: 54 }); } catch (e) { /* ignore */ }
      }
      if (logoImageSource) {
        try { doc.image(logoImageSource, right - 96, headerTop, { fit: [96, 46], align: 'right' }); } catch (e) { /* ignore */ }
      }
      doc.fontSize(19).font('Helvetica-Bold').fillColor(ACCENT).text('ELECTRONIC TICKET', left + 66, headerTop + 6);
      doc.fontSize(9).font('Helvetica').fillColor(MUTE).text(`Ref: ${ref}`, left + 66, headerTop + 30);
      doc.y = headerTop + 62;
      doc.moveTo(left, doc.y).lineTo(right, doc.y).lineWidth(1.2).strokeColor(ACCENT).stroke();
      doc.moveDown(0.8);

      // ── BOOKING INFO BOX ──────────────────────────────────────
      const boxTop = doc.y;
      const boxH = 74;
      doc.rect(left, boxTop, width, boxH).lineWidth(0.8).strokeColor(LINE).stroke();
      const colL = left + 12;
      const colR = left + width / 2 + 12;
      doc.fontSize(9).font('Helvetica-Bold').fillColor(INK);
      doc.text('Booking Reference:', colL, boxTop + 12, { continued: true }).font('Helvetica').fillColor('#333').text(`  ${ref}`);
      doc.font('Helvetica-Bold').fillColor(INK).text('Booked At:', colL, boxTop + 30, { continued: true })
        .font('Helvetica').fillColor('#333').text(`  ${new Date(booking.createdAt).toLocaleString('en-GB')}`);
      doc.font('Helvetica-Bold').fillColor(INK).text('Status:', colL, boxTop + 48, { continued: true })
        .font('Helvetica-Bold').fillColor(st.color).text(`  ${st.text}`);

      // Booking agency (the USER) — name / email / contact. Never admin identity.
      const agName = agency?.agencyName || 'Agency';
      const agEmail = agency?.email || '';
      const agContact = agency?.phone || agency?.contactPerson || '';
      doc.fontSize(9).font('Helvetica-Bold').fillColor(INK).text('Agency:', colR, boxTop + 12, { continued: true })
        .font('Helvetica').fillColor('#333').text(`  ${agName}`);
      doc.font('Helvetica-Bold').fillColor(INK).text('Email:', colR, boxTop + 30, { continued: true })
        .font('Helvetica').fillColor('#333').text(`  ${agEmail}`);
      doc.font('Helvetica-Bold').fillColor(INK).text('Contact:', colR, boxTop + 48, { continued: true })
        .font('Helvetica').fillColor('#333').text(`  ${agContact}`);
      doc.y = boxTop + boxH + 16;

      // ── PASSENGER TABLE ───────────────────────────────────────
      doc.fontSize(11).font('Helvetica-Bold').fillColor(ACCENT).text('PASSENGER DETAILS', left, doc.y);
      doc.moveDown(0.4);
      const ptTop = doc.y;
      doc.rect(left, ptTop, width, 20).fill('#eef2f8');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(INK);
      doc.text('SR #', left + 8, ptTop + 6);
      doc.text('PASSENGER NAME', left + 50, ptTop + 6);
      doc.text('PASSPORT', left + 250, ptTop + 6);
      doc.text('MEAL', left + 360, ptTop + 6);
      doc.text('STATUS', left + 430, ptTop + 6);
      let ry = ptTop + 20;
      passengers.forEach((p, i) => {
        doc.rect(left, ry, width, 18).fill(i % 2 === 0 ? '#ffffff' : '#f7f9fc');
        doc.fontSize(8.5).font('Helvetica').fillColor('#222');
        const name = p.givenName || p.surname
          ? `${p.title || ''} ${p.givenName || ''} ${p.surname || ''}`.replace(/\s+/g, ' ').trim()
          : (p.name || '');
        doc.text(String(i + 1), left + 8, ry + 5);
        doc.text(name.toUpperCase(), left + 50, ry + 5, { width: 195 });
        doc.text(p.passport || p.cnic || '-', left + 250, ry + 5, { width: 105 });
        doc.text((flight.meal || '-'), left + 360, ry + 5, { width: 65 });
        doc.font('Helvetica-Bold').fillColor(st.color).text(st.text, left + 430, ry + 5);
        ry += 18;
      });
      doc.moveTo(left, ry).lineTo(right, ry).lineWidth(0.6).strokeColor(LINE).stroke();
      doc.y = ry + 18;

      // ── TRAVEL ITINERARY ──────────────────────────────────────
      doc.fontSize(11).font('Helvetica-Bold').fillColor(ACCENT).text('TRAVEL ITINERARY', left, doc.y);
      doc.moveDown(0.5);

      segments.forEach((seg, idx) => {
        const flightNo = segments.length > 1 ? `Flight ${idx + 1}` : 'Flight';
        // Sub-header bar
        const shTop = doc.y;
        doc.rect(left, shTop, width, 18).fill('#eef2f8');
        doc.fontSize(9).font('Helvetica-Bold').fillColor(INK)
          .text(`${flightNo}  -  ${(seg.departureCity || '').toUpperCase()} to ${(seg.destinationCity || '').toUpperCase()}`, left + 8, shTop + 5);
        doc.y = shTop + 24;

        // Body row: airline / flight# / departure / arrival
        const bTop = doc.y;
        doc.fontSize(7.5).font('Helvetica-Bold').fillColor(MUTE);
        doc.text('AIRLINE', left + 8, bTop);
        doc.text('FLIGHT #', left + 150, bTop);
        doc.text('DEPARTURE', left + 250, bTop);
        doc.text('ARRIVAL', left + 400, bTop);

        doc.fontSize(9.5).font('Helvetica-Bold').fillColor(INK);
        doc.text(seg.airlineName || '-', left + 8, bTop + 12, { width: 135 });
        doc.text(seg.flightNumber || '-', left + 150, bTop + 12, { width: 95 });
        // Departure
        doc.text(seg.departureTime || '', left + 250, bTop + 12);
        doc.fontSize(8).font('Helvetica').fillColor('#333');
        doc.text(seg.departureCity || '', left + 250, bTop + 26, { width: 140 });
        doc.text(dateLong(seg.departureDate), left + 250, bTop + 38, { width: 140 });
        // Arrival
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor(INK).text(seg.arrivalTime || '', left + 400, bTop + 12);
        doc.fontSize(8).font('Helvetica').fillColor('#333');
        doc.text(seg.destinationCity || '', left + 400, bTop + 26, { width: 130 });
        doc.text(dateLong(seg.arrivalDate), left + 400, bTop + 38, { width: 130 });
        // Baggage
        doc.fontSize(8).font('Helvetica-Bold').fillColor(MUTE).text('Baggage:', left + 8, bTop + 32, { continued: true })
          .font('Helvetica').fillColor('#333').text(`  ${seg.baggage || '-'}`);

        doc.y = bTop + 56;
        doc.moveTo(left, doc.y).lineTo(right, doc.y).lineWidth(0.5).strokeColor(LINE).stroke();
        doc.moveDown(0.6);
      });

      // ── TERMS ─────────────────────────────────────────────────
      doc.moveDown(0.3);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(ACCENT).text('TERMS & CONDITIONS', left, doc.y);
      doc.moveDown(0.3);
      doc.fontSize(7.5).font('Helvetica').fillColor(DANGER);
      doc.text('1.  After confirmation, tickets are NON-REFUNDABLE and NON-CHANGEABLE at any time.', left, doc.y, { width });
      doc.fillColor('#444').text('2.  All visa and travel documents are the traveller\'s own responsibility.', { width });
      doc.text('3.  Always re-confirm your flight and baggage with the airline 72 hours before departure.', { width });

      // ── FOOTER (neutral — no admin identity) ──────────────────
      const footerY = doc.page.height - 40;
      doc.moveTo(left, footerY).lineTo(right, footerY).lineWidth(0.8).strokeColor(LINE).stroke();
      doc.fontSize(6.5).font('Helvetica').fillColor(MUTE).text(
        `Generated ${new Date().toLocaleString('en-GB')}`,
        left,
        footerY + 6,
        { width, align: 'center' }
      );

      doc.end();
      stream.on('finish', () => resolve(ticketPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateETicket, TICKETS_DIR };
