const { getPendingAgencies } = require('../controllers/authController');

module.exports = async (req, res) => {
  // You may need to add authentication checks here for admin access
  await getPendingAgencies(req, res);
};
