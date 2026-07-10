// SMS Service — template ready for a Pakistani SMS provider (Jazz, Zong, Telenor…).
// Wire the provider HTTP call inside sendSMS when credentials are available.

async function sendSMS(phoneNumber, message) {
  try {
    // eslint-disable-next-line no-console
    console.log(`[sms] to ${phoneNumber}: ${message}`);
    // Example:
    // await axios.post(process.env.SMS_API_ENDPOINT, { phone: phoneNumber, message, apiKey: process.env.SMS_API_KEY });
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[sms] error:', error.message);
    return false;
  }
}

const sendBookingConfirmationSMS = (phoneNumber, bookingId, flightNumber) =>
  sendSMS(phoneNumber, `Booking confirmed! Ref: ${bookingId}. Flight: ${flightNumber}. Check email for e-ticket.`);

const sendCancellationSMS = (phoneNumber, bookingId) =>
  sendSMS(phoneNumber, `Your booking ${bookingId} has been cancelled. Please check your email for details.`);

module.exports = { sendSMS, sendBookingConfirmationSMS, sendCancellationSMS };
