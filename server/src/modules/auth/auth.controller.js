const service = require('./auth.service');

exports.adminLogin = async (req, res) => {
  const result = await service.adminLogin(req.body);
  res.status(200).json({ message: 'Login successful', ...result });
};

exports.agencyRegister = async (req, res) => {
  const result = await service.agencyRegister(req.body);
  res.status(201).json({
    message: 'Agency registration request submitted. Please wait for admin approval.',
    ...result,
  });
};

exports.agencyLogin = async (req, res) => {
  const result = await service.agencyLogin(req.body);
  res.status(200).json({ message: 'Login successful', ...result });
};

exports.requestAgencyPasswordReset = async (req, res) => {
  await service.requestAgencyPasswordReset(req.body);
  res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
};

exports.resetAgencyPassword = async (req, res) => {
  await service.resetAgencyPassword(req.body);
  res.status(200).json({ message: 'Password reset successful' });
};
