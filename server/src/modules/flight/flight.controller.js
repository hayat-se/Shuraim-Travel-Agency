const service = require('./flight.service');

const parseId = (req) => parseInt(req.params.flightId, 10);

exports.create = async (req, res) => {
  const flight = await service.create(req.body, req.user.id);
  res.status(201).json({ message: 'Flight created successfully', flight });
};

exports.list = async (req, res) => {
  res.json(await service.listActive());
};

exports.search = async (req, res) => {
  res.json(await service.search(req.query));
};

exports.getById = async (req, res) => {
  res.json(await service.getById(parseId(req)));
};

exports.update = async (req, res) => {
  const flight = await service.update(parseId(req), req.body);
  res.json({ message: 'Flight updated successfully', flight });
};

exports.cancel = async (req, res) => {
  const flight = await service.cancel(parseId(req));
  res.json({ message: 'Flight cancelled successfully', flight });
};

exports.remove = async (req, res) => {
  await service.remove(parseId(req));
  res.json({ message: 'Flight deleted successfully' });
};

exports.availability = async (req, res) => {
  res.json(await service.availability(parseId(req)));
};
