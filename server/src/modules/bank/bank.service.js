const prisma = require('../../config/prisma');
const ApiError = require('../../middleware/ApiError');

const PUBLIC_SELECT = {
  id: true,
  bankName: true,
  accountTitle: true,
  accountNumber: true,
  iban: true,
  branchName: true,
  branchCode: true,
  branchAddress: true,
  city: true,
  imageUrl: true,
  isActive: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
};

const listAll = () => prisma.bank.findMany({ select: PUBLIC_SELECT, orderBy: { createdAt: 'desc' } });

const listActive = () =>
  prisma.bank.findMany({ where: { isActive: true }, select: PUBLIC_SELECT, orderBy: { createdAt: 'desc' } });

const toBool = (v) => (typeof v === 'string' ? v === 'true' : Boolean(v));
const orNull = (v) => (v === undefined || v === '' ? null : v);

async function create(body, file, adminId) {
  const { bankName, accountTitle, accountNumber } = body;
  if (!bankName || !accountTitle || !accountNumber) {
    throw ApiError.badRequest('Bank name, account title, and account number are required');
  }
  const bank = await prisma.bank.create({
    data: {
      bankName,
      accountTitle,
      accountNumber,
      iban: orNull(body.iban),
      branchName: orNull(body.branchName),
      branchCode: orNull(body.branchCode),
      branchAddress: orNull(body.branchAddress),
      city: orNull(body.city),
      isActive: body.isActive === undefined ? true : toBool(body.isActive),
      createdBy: adminId || null,
      imageData: file ? file.buffer : null,
      imageMimeType: file ? file.mimetype : null,
    },
  });
  if (file) {
    await prisma.bank.update({ where: { id: bank.id }, data: { imageUrl: `/api/images/banks/${bank.id}` } });
  }
  return prisma.bank.findUnique({ where: { id: bank.id }, select: PUBLIC_SELECT });
}

async function update(id, body, file) {
  const bank = await prisma.bank.findUnique({ where: { id } });
  if (!bank) throw ApiError.notFound('Bank not found');

  const data = {};
  ['bankName', 'accountTitle', 'accountNumber'].forEach((k) => {
    if (body[k]) data[k] = body[k];
  });
  ['iban', 'branchName', 'branchCode', 'branchAddress', 'city'].forEach((k) => {
    if (body[k] !== undefined) data[k] = body[k];
  });
  if (body.isActive !== undefined) data.isActive = toBool(body.isActive);
  if (file) {
    data.imageData = file.buffer;
    data.imageMimeType = file.mimetype;
    data.imageUrl = `/api/images/banks/${id}`;
  }
  return prisma.bank.update({ where: { id }, data, select: PUBLIC_SELECT });
}

async function remove(id) {
  const bank = await prisma.bank.findUnique({ where: { id } });
  if (!bank) throw ApiError.notFound('Bank not found');
  await prisma.bank.delete({ where: { id } });
}

module.exports = { listAll, listActive, create, update, remove };
