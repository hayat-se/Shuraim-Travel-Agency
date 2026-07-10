const service = require('./feedback.service');

exports.create = async (req, res) => {
  const feedback = await service.create(req.user.id, req.body);
  res.status(201).json({ message: 'Feedback submitted successfully', feedback });
};

exports.listMine = async (req, res) => {
  res.json(await service.listForAgency(req.user.id));
};

exports.listAll = async (req, res) => {
  res.json(await service.listAll());
};

exports.updateStatus = async (req, res) => {
  const feedback = await service.updateStatus(parseInt(req.params.id, 10), req.body);
  res.json({ message: 'Feedback updated', feedback });
};
