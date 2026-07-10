const service = require('./airline.service');

const parseId = (req) => parseInt(req.params.id, 10);

exports.listAll = async (req, res) => res.json(await service.listAll());
exports.listActive = async (req, res) => res.json(await service.listActive());

exports.create = async (req, res) => {
  const airline = await service.create(req.body, req.file, req.user.id);
  res.status(201).json({ message: 'Airline created successfully', airline });
};

exports.update = async (req, res) => {
  const airline = await service.update(parseId(req), req.body, req.file);
  res.json({ message: 'Airline updated successfully', airline });
};

exports.remove = async (req, res) => {
  await service.remove(parseId(req));
  res.json({ message: 'Airline deleted successfully' });
};
