const service = require('./payment.service');

exports.create = async (req, res) => {
  const payment = await service.create(req.user.id, req.body);
  res.status(201).json({ message: 'Payment submitted successfully', payment });
};

exports.listMine = async (req, res) => {
  res.json(await service.listForAgency(req.user.id));
};

exports.listAll = async (req, res) => {
  res.json(await service.listAll());
};

exports.updateStatus = async (req, res) => {
  const payment = await service.updateStatus(parseInt(req.params.id, 10), req.body, req.user.id);
  res.json({ message: 'Payment status updated', payment });
};
