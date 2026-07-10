const prisma = require('../../config/prisma');
const ApiError = require('../../middleware/ApiError');

const BANK_SELECT = { id: true, bankName: true, accountTitle: true, accountNumber: true };
const AGENCY_SELECT = { id: true, agencyName: true, email: true, city: true };

async function create(agencyId, body) {
  const { bankId, amount, referenceNumber, paymentDate, notes, proofUrl } = body;
  if (!bankId || !amount || !referenceNumber) {
    throw ApiError.badRequest('Bank, amount, and reference number are required');
  }
  if (Number(amount) <= 0) throw ApiError.badRequest('Amount must be greater than zero');

  const bank = await prisma.bank.findUnique({ where: { id: parseInt(bankId, 10) } });
  if (!bank || !bank.isActive) throw ApiError.badRequest('Selected bank is not available');

  return prisma.payment.create({
    data: {
      agencyId,
      bankId: parseInt(bankId, 10),
      amount,
      referenceNumber,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      notes: notes || null,
      proofUrl: proofUrl || null,
    },
  });
}

const listForAgency = (agencyId) =>
  prisma.payment.findMany({
    where: { agencyId },
    include: { bank: { select: BANK_SELECT } },
    orderBy: { createdAt: 'desc' },
  });

const listAll = () =>
  prisma.payment.findMany({
    include: { bank: { select: BANK_SELECT }, agency: { select: AGENCY_SELECT } },
    orderBy: { createdAt: 'desc' },
  });

async function updateStatus(id, { status, notes }, adminId) {
  if (!['approved', 'rejected'].includes(status)) throw ApiError.badRequest('Invalid status');
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw ApiError.notFound('Payment not found');
  return prisma.payment.update({
    where: { id },
    data: {
      status,
      notes: notes || payment.notes,
      approvedBy: adminId,
      approvedAt: status === 'approved' ? new Date() : null,
    },
  });
}

module.exports = { create, listForAgency, listAll, updateStatus };
