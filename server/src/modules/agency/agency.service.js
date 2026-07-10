const prisma = require('../../config/prisma');
const ApiError = require('../../middleware/ApiError');
const { sendApprovalEmail, sendRejectionEmail } = require('../../services/emailService');

// Never expose secrets when returning agency records to the admin UI.
const SAFE_SELECT = {
  id: true,
  agencyName: true,
  email: true,
  contactPerson: true,
  phone: true,
  phone2: true,
  address: true,
  city: true,
  registrationNumber: true,
  taxId: true,
  role: true,
  status: true,
  rejectionReason: true,
  approvedBy: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
};

const listAll = () => prisma.agency.findMany({ select: SAFE_SELECT, orderBy: { createdAt: 'desc' } });

const listPending = () =>
  prisma.agency.findMany({ where: { status: 'pending' }, select: SAFE_SELECT, orderBy: { createdAt: 'desc' } });

async function getOrThrow(id) {
  const agency = await prisma.agency.findUnique({ where: { id } });
  if (!agency) throw ApiError.notFound('Agency not found');
  return agency;
}

async function approve(id, adminId) {
  const agency = await getOrThrow(id);
  const updated = await prisma.agency.update({
    where: { id },
    data: { status: 'approved', approvedAt: new Date(), approvedBy: adminId },
    select: SAFE_SELECT,
  });
  sendApprovalEmail(agency.agencyName, agency.email); // fire-and-forget
  return updated;
}

async function reject(id, reason) {
  const agency = await getOrThrow(id);
  const updated = await prisma.agency.update({
    where: { id },
    data: { status: 'rejected', rejectionReason: reason },
    select: SAFE_SELECT,
  });
  sendRejectionEmail(agency.agencyName, agency.email, reason);
  return updated;
}

async function block(id) {
  await getOrThrow(id);
  return prisma.agency.update({ where: { id }, data: { status: 'blocked' }, select: SAFE_SELECT });
}

async function unblock(id) {
  const agency = await getOrThrow(id);
  if (agency.status !== 'blocked') throw ApiError.badRequest('Agency is not blocked');
  return prisma.agency.update({ where: { id }, data: { status: 'approved' }, select: SAFE_SELECT });
}

module.exports = { listAll, listPending, approve, reject, block, unblock };
