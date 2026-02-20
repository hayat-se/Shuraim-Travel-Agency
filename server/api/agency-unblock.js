const { unblockAgency } = require('../controllers/authController');

module.exports = async (req, res) => {
  // TODO: Add authentication checks for admin
  req.params = { agencyId: req.query.agencyId };
  await unblockAgency(req, res);
};
