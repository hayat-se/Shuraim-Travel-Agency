const prisma = require('../../config/prisma');
const ApiError = require('../../middleware/ApiError');

// Exclude BLOB columns from list/detail payloads (served separately via /api/images).
const PUBLIC_SELECT = {
  id: true,
  name: true,
  code: true,
  logoUrl: true,
  isActive: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
};

const listAll = () => prisma.airline.findMany({ select: PUBLIC_SELECT, orderBy: { name: 'asc' } });

const listActive = () =>
  prisma.airline.findMany({ where: { isActive: true }, select: PUBLIC_SELECT, orderBy: { name: 'asc' } });

async function create({ name, code }, file, adminId) {
  const existing = await prisma.airline.findUnique({ where: { name } });
  if (existing) throw ApiError.badRequest('Airline with this name already exists');

  const airline = await prisma.airline.create({
    data: {
      name,
      code: code || null,
      isActive: true,
      createdBy: adminId || null,
      logoData: file ? file.buffer : null,
      logoMimeType: file ? file.mimetype : null,
    },
  });
  if (file) {
    await prisma.airline.update({ where: { id: airline.id }, data: { logoUrl: `/api/images/airlines/${airline.id}` } });
  }
  return prisma.airline.findUnique({ where: { id: airline.id }, select: PUBLIC_SELECT });
}

async function update(id, body, file) {
  const airline = await prisma.airline.findUnique({ where: { id } });
  if (!airline) throw ApiError.notFound('Airline not found');

  const data = {};
  if (body.name) data.name = body.name;
  if (body.code !== undefined) data.code = body.code;
  if (body.isActive !== undefined) {
    data.isActive = typeof body.isActive === 'string' ? body.isActive === 'true' : body.isActive;
  }
  if (file) {
    data.logoData = file.buffer;
    data.logoMimeType = file.mimetype;
    data.logoUrl = `/api/images/airlines/${id}`;
  }
  return prisma.airline.update({ where: { id }, data, select: PUBLIC_SELECT });
}

async function remove(id) {
  const airline = await prisma.airline.findUnique({ where: { id } });
  if (!airline) throw ApiError.notFound('Airline not found');
  await prisma.airline.delete({ where: { id } });
}

module.exports = { listAll, listActive, create, update, remove };
