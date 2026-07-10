const service = require('./agency.service');

const parseId = (req) => parseInt(req.params.id, 10);

exports.listAll = async (req, res) => {
  res.json(await service.listAll());
};

exports.listPending = async (req, res) => {
  res.json(await service.listPending());
};

exports.approve = async (req, res) => {
  const agency = await service.approve(parseId(req), req.user.id);
  res.json({ message: 'Agency approved successfully', agency });
};

exports.reject = async (req, res) => {
  const agency = await service.reject(parseId(req), req.body.reason);
  res.json({ message: 'Agency rejected', agency });
};

exports.block = async (req, res) => {
  const agency = await service.block(parseId(req));
  res.json({ message: 'Agency blocked', agency });
};

exports.unblock = async (req, res) => {
  const agency = await service.unblock(parseId(req));
  res.json({ message: 'Agency unblocked successfully', agency });
};
