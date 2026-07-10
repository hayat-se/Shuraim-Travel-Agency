const service = require('./bank.service');

const parseId = (req) => parseInt(req.params.id, 10);

exports.listAll = async (req, res) => res.json(await service.listAll());
exports.listActive = async (req, res) => res.json(await service.listActive());

exports.create = async (req, res) => {
  const bank = await service.create(req.body, req.file, req.user.id);
  res.status(201).json({ message: 'Bank created successfully', bank });
};

exports.update = async (req, res) => {
  const bank = await service.update(parseId(req), req.body, req.file);
  res.json({ message: 'Bank updated successfully', bank });
};

exports.remove = async (req, res) => {
  await service.remove(parseId(req));
  res.json({ message: 'Bank deleted successfully' });
};
