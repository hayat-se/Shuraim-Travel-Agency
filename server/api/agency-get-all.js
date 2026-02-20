const { getAllAgencies } = require('../controllers/authController');

module.exports = async (req, res) => {
  // TODO: Add authentication checks for admin
  await getAllAgencies(req, res);
};
