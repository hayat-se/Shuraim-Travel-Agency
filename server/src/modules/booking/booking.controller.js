const service = require('./booking.service');

exports.create = async (req, res) => {
  const result = await service.createForAgency(req.user, req.body);
  res.status(201).json({ message: 'Booking created successfully', ...result });
};

exports.createGuest = async (req, res) => {
  const result = await service.createForGuest(req.body);
  res.status(201).json({ message: 'Booking created successfully! E-ticket sent to your email.', ...result });
};

exports.listMine = async (req, res) => {
  res.json(await service.listForAgency(req.user.id));
};

exports.listAll = async (req, res) => {
  res.json(await service.listAll());
};

exports.getOne = async (req, res) => {
  res.json(await service.getByBookingId(req.params.bookingId));
};

exports.update = async (req, res) => {
  const booking = await service.updatePassengers(req.params.bookingId, req.user, req.body.passengers);
  res.json({ message: 'Booking updated', booking });
};

exports.confirm = async (req, res) => {
  const booking = await service.confirm(req.params.bookingId, req.user);
  res.json({ message: 'Booking confirmed and sold', booking });
};

exports.cancel = async (req, res) => {
  const booking = await service.cancel(req.params.bookingId, req.user, req.body.reason);
  res.json({ message: 'Booking cancelled successfully', booking });
};
