const { Payment, Bank, Agency } = require('../config/database');

const createPayment = async (req, res) => {
  try {
    const { bankId, amount, referenceNumber, paymentDate, notes, proofUrl } = req.body;

    if (!bankId || !amount || !referenceNumber) {
      return res.status(400).json({ error: 'Bank, amount, and reference number are required' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    const bank = await Bank.findByPk(bankId);
    if (!bank || !bank.isActive) {
      return res.status(400).json({ error: 'Selected bank is not available' });
    }

    const payment = await Payment.create({
      agencyId: req.user.id,
      bankId,
      amount,
      referenceNumber,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      notes: notes || null,
      proofUrl: proofUrl || null
    });

    res.status(201).json({ message: 'Payment submitted successfully', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAgencyPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { agencyId: req.user.id },
      include: [{ model: Bank, as: 'bank' }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: Bank, as: 'bank' },
        { model: Agency, as: 'agency' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await payment.update({
      status,
      notes: notes || payment.notes,
      approvedBy: req.user.id,
      approvedAt: status === 'approved' ? new Date() : null
    });

    res.status(200).json({ message: 'Payment status updated', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPayment,
  getAgencyPayments,
  getAllPayments,
  updatePaymentStatus
};
