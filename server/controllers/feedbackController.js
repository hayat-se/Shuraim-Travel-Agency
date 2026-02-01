const { Feedback, Agency } = require('../config/database');

const createFeedback = async (req, res) => {
  try {
    const { rating, subject, message, category } = req.body;

    if (!rating || !message) {
      return res.status(400).json({ error: 'Rating and message are required' });
    }

    const feedback = await Feedback.create({
      agencyId: req.user.id,
      rating,
      subject: subject || null,
      message,
      category: category || 'general'
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAgencyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findAll({
      where: { agencyId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findAll({
      include: [{ model: Agency, as: 'agency' }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status, adminReply } = req.body;

    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    await feedback.update({
      status: status || feedback.status,
      adminReply: adminReply || feedback.adminReply
    });

    res.status(200).json({ message: 'Feedback updated', feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFeedback,
  getAgencyFeedback,
  getAllFeedback,
  updateFeedbackStatus
};
