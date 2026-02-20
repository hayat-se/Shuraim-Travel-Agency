const { rejectAgency } = require('../controllers/authController');

module.exports = async (req, res) => {
  // TODO: Add authentication checks for admin
  req.params = { agencyId: req.query.agencyId };
  req.body = { reason: req.query.reason };
  await rejectAgency(req, res);
};
