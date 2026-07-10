const service = require('./group.service');

const parseId = (req) => parseInt(req.params.id, 10);

exports.listAll = async (req, res) => res.json(await service.listAll());
exports.listActive = async (req, res) => res.json(await service.listActive());

exports.create = async (req, res) => {
  const group = await service.create(req.body, req.file, req.user.id);
  res.status(201).json({ message: 'Group created successfully', group });
};

exports.update = async (req, res) => {
  const group = await service.update(parseId(req), req.body, req.file);
  res.json({ message: 'Group updated successfully', group });
};
