const { Resend } = require('resend');
const env = require('../config/env');

let resend = null;
if (env.email.resendApiKey) {
  resend = new Resend(env.email.resendApiKey);
}
const FROM_EMAIL = env.email.from;

const baseStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
  .content { border: 1px solid #e2e8f0; padding: 20px; }
  .flight-details { background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
  .otp { font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #2563eb; margin: 16px 0; }
  .footer { background-color: #f8fafc; padding: 10px; text-align: center; font-size: 12px; color: #64748b; }
`;

const wrap = (title, inner) => `
  <!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
    <div class="container">
      <div class="header"><h2>${title}</h2></div>
      <div class="content">${inner}</div>
      <div class="footer"><p>&copy; ${new Date().getFullYear()} Shuraim Travel Agency. All rights reserved.</p></div>
    </div>
  </body></html>`;

async function sendEmail(to, subject, htmlContent, attachments = []) {
  if (!resend) {
    // eslint-disable-next-line no-console
    console.warn('[email] Skipped (RESEND_API_KEY not configured):', subject);
    return false;
  }
  try {
    const emailData = { from: FROM_EMAIL, to, subject, html: htmlContent };
    if (attachments.length) emailData.attachments = attachments;
    const { error } = await resend.emails.send(emailData);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[email] send error:', error);
      return false;
    }
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[email] send exception:', err);
    return false;
  }
}

const sendApprovalEmail = (agencyName, email) =>
  sendEmail(
    email,
    'Account Approved - Shuraim Travel Agency',
    wrap(
      'Account Approved',
      `<p>Dear <strong>${agencyName}</strong>,</p>
       <p>Congratulations! Your agency account has been approved. You can now search and book flights,
       manage bookings, and download e-tickets.</p>`
    )
  );

const sendRejectionEmail = (agencyName, email, reason) =>
  sendEmail(
    email,
    'Application Decision - Shuraim Travel Agency',
    wrap(
      'Application Decision',
      `<p>Dear <strong>${agencyName}</strong>,</p>
       <p>Unfortunately, your application has been rejected.</p>
       <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>`
    )
  );

const sendPasswordResetOtpEmail = (agencyName, email, otp) =>
  sendEmail(
    email,
    'Password Reset OTP - Shuraim Travel Agency',
    wrap(
      'Password Reset Request',
      `<p>Dear <strong>${agencyName}</strong>,</p>
       <p>Use the OTP below to reset your password. This code is valid for 10 minutes.</p>
       <div class="otp">${otp}</div>
       <p>If you did not request this, please ignore this email.</p>`
    )
  );

const sendBookingConfirmationEmail = (email, agencyName, bookingId, flightDetails, totalPrice, pdfPath) => {
  const inner = `
    <p>Dear <strong>${agencyName}</strong>,</p>
    <p>Your booking has been confirmed successfully!</p>
    <div class="flight-details">
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Flight:</strong> ${flightDetails.airlineName} ${flightDetails.flightNumber}</p>
      <p><strong>Route:</strong> ${flightDetails.departureCity} → ${flightDetails.destinationCity}</p>
      <p><strong>Departure:</strong> ${flightDetails.departureDate} at ${flightDetails.departureTime}</p>
      <p><strong>Total Price:</strong> PKR ${totalPrice}</p>
    </div>
    <p>Your e-ticket is attached. Please download and keep it safe.</p>`;
  const attachments = pdfPath ? [{ filename: `ticket-${bookingId}.pdf`, path: pdfPath }] : [];
  return sendEmail(email, `Booking Confirmation - ${bookingId}`, wrap('Booking Confirmation', inner), attachments);
};

module.exports = {
  sendEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendPasswordResetOtpEmail,
  sendBookingConfirmationEmail,
};
