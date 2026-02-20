const { getPendingAgencies } = require('../controllers/authController');

module.exports = async (req, res) => {
  // TODO: Add authentication checks for admin
  await getPendingAgencies(req, res);
};
