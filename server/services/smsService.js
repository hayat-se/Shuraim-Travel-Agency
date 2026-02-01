// SMS Service - Pakistan-friendly implementation
// This is API-ready for SMS providers like Jazz, Zong, Telenor, etc.

const sendSMS = async (phoneNumber, message) => {
  try {
    // This is a template for SMS integration
    // Replace with actual SMS provider API call
    // Example providers: Jazz SMS, Zong, Telenor, Warid SMS API
    
    console.log(`SMS sent to ${phoneNumber}: ${message}`);
    
    // Actual implementation would look like:
    // const response = await axios.post('YOUR_SMS_API_ENDPOINT', {
    //   phone: phoneNumber,
    //   message: message,
    //   apiKey: process.env.SMS_API_KEY
    // });
    
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

const sendBookingConfirmationSMS = async (phoneNumber, bookingId, flightNumber) => {
  const message = `Booking confirmed! Ref: ${bookingId}. Flight: ${flightNumber}. Check email for e-ticket.`;
  return sendSMS(phoneNumber, message);
};

const sendCancellationSMS = async (phoneNumber, bookingId) => {
  const message = `Your booking ${bookingId} has been cancelled. Please check your email for details.`;
  return sendSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendBookingConfirmationSMS,
  sendCancellationSMS
};
