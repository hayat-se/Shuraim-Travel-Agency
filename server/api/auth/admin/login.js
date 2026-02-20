const { adminLogin } = require('../../../../controllers/authController');

module.exports = async (req, res) => {
  await adminLogin(req, res);
};
