const {
  getAllAgencies,
  getPendingAgencies,
  approveAgency,
  rejectAgency,
  blockAgency,
  unblockAgency
} = require('../controllers/authController');

module.exports = async (req, res) => {
  const action = req.query.action;
  const agencyId = req.query.agencyId;
  const reason = req.query.reason;

  if (req.method === 'GET') {
    if (action === 'pending') {
      await getPendingAgencies(req, res);
    } else {
      await getAllAgencies(req, res);
    }
  } else if (req.method === 'PUT') {
    if (action === 'approve') {
      req.params = { agencyId };
      await approveAgency(req, res);
    } else if (action === 'reject') {
      req.params = { agencyId };
      req.body = { reason };
      await rejectAgency(req, res);
    } else if (action === 'block') {
      req.params = { agencyId };
      await blockAgency(req, res);
    } else if (action === 'unblock') {
      req.params = { agencyId };
      await unblockAgency(req, res);
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
