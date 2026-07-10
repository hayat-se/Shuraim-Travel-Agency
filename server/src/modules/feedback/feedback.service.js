const prisma = require('../../config/prisma');
const ApiError = require('../../middleware/ApiError');

async function create(agencyId, { rating, subject, message, category }) {
  if (!rating || !message) throw ApiError.badRequest('Rating and message are required');
  return prisma.feedback.create({
    data: {
      agencyId,
      rating: parseInt(rating, 10),
      subject: subject || null,
      message,
      category: category || 'general',
    },
  });
}

const listForAgency = (agencyId) =>
  prisma.feedback.findMany({ where: { agencyId }, orderBy: { createdAt: 'desc' } });

const listAll = () =>
  prisma.feedback.findMany({
    include: { agency: { select: { id: true, agencyName: true, email: true, city: true } } },
    orderBy: { createdAt: 'desc' },
  });

async function updateStatus(id, { status, adminReply }) {
  const feedback = await prisma.feedback.findUnique({ where: { id } });
  if (!feedback) throw ApiError.notFound('Feedback not found');
  return prisma.feedback.update({
    where: { id },
    data: {
      status: status || feedback.status,
      adminReply: adminReply !== undefined ? adminReply : feedback.adminReply,
    },
  });
}

module.exports = { create, listForAgency, listAll, updateStatus };
