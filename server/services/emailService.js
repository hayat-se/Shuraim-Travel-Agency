const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_vyQAuteV_5zuScEZxibam6QFVz9Zd9YYP');
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// Email template for agency approval
const approvalEmailTemplate = (agencyName, email) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0066cc; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { border: 1px solid #ddd; padding: 20px; }
        .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
        .button { background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Account Approval - Airline Agency Management System</h2>
        </div>
        <div class="content">
          <p>Dear <strong>${agencyName}</strong>,</p>
          <p>Congratulations! Your agency account has been approved by the Super Admin.</p>
          <p>You can now:</p>
          <ul>
            <li>Search and book flights</li>
            <li>Manage your bookings</li>
            <li>Download e-tickets</li>
            <li>View booking history</li>
          </ul>
          <a href="http://localhost:3000/login" class="button">Login to Your Account</a>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br/>Airline Agency Management System Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Airline Agency Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for booking confirmation
const bookingConfirmationTemplate = (agencyName, bookingId, flightDetails, totalPrice) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0066cc; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { border: 1px solid #ddd; padding: 20px; }
        .flight-details { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0; }
        .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Booking Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear <strong>${agencyName}</strong>,</p>
          <p>Your booking has been confirmed successfully!</p>
          <div class="flight-details">
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Flight:</strong> ${flightDetails.airlineName} ${flightDetails.flightNumber}</p>
            <p><strong>Route:</strong> ${flightDetails.departureCity} → ${flightDetails.destinationCity}</p>
            <p><strong>Departure:</strong> ${flightDetails.departureDate} at ${flightDetails.departureTime}</p>
            <p><strong>Total Price:</strong> PKR ${totalPrice}</p>
          </div>
          <p>Your e-ticket has been attached to this email. Please download and keep it safe.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br/>Airline Agency Management System Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Airline Agency Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmail = async (to, subject, htmlContent, attachments = []) => {
  try {
    const emailData = {
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    // Add attachments if provided (Resend supports attachments)
    if (attachments && attachments.length > 0) {
      emailData.attachments = attachments;
    }

    const { data, error } = await resend.emails.send(emailData);
    
    if (error) {
      console.error('Error sending email:', error);
      return false;
    }
    
    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

const sendApprovalEmail = async (agencyName, email) => {
  const htmlContent = approvalEmailTemplate(agencyName, email);
  return sendEmail(email, 'Account Approved - Airline Agency Management System', htmlContent);
};

const sendBookingConfirmationEmail = async (email, agencyName, bookingId, flightDetails, totalPrice, pdfPath) => {
  const htmlContent = bookingConfirmationTemplate(agencyName, bookingId, flightDetails, totalPrice);
  const attachments = pdfPath ? [{ filename: `ticket-${bookingId}.pdf`, path: pdfPath }] : [];
  return sendEmail(email, `Booking Confirmation - ${bookingId}`, htmlContent, attachments);
};

const sendRejectionEmail = async (agencyName, email, reason) => {
  const subject = 'Application Decision - Airline Agency Management System';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #d32f2f; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { border: 1px solid #ddd; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Application Decision</h2>
        </div>
        <div class="content">
          <p>Dear <strong>${agencyName}</strong>,</p>
          <p>Unfortunately, your application has been rejected.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please contact our support team if you have any questions.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail(email, subject, htmlContent);
};

module.exports = {
  sendApprovalEmail,
  sendBookingConfirmationEmail,
  sendRejectionEmail,
  sendEmail
};
