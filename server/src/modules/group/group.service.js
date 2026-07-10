const prisma = require('../../config/prisma');
const ApiError = require('../../middleware/ApiError');

const PUBLIC_SELECT = {
  id: true,
  name: true,
  imageUrl: true,
  isActive: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
};

const listAll = () => prisma.group.findMany({ select: PUBLIC_SELECT, orderBy: { createdAt: 'desc' } });

const listActive = () =>
  prisma.group.findMany({ where: { isActive: true }, select: PUBLIC_SELECT, orderBy: { createdAt: 'desc' } });

const toBool = (v) => (typeof v === 'string' ? v === 'true' : Boolean(v));

async function create({ name, isActive }, file, adminId) {
  const existing = await prisma.group.findUnique({ where: { name } });
  if (existing) throw ApiError.badRequest('Group name already exists');

  const group = await prisma.group.create({
    data: {
      name,
      isActive: isActive === undefined ? true : toBool(isActive),
      createdBy: adminId || null,
      imageData: file ? file.buffer : null,
      imageMimeType: file ? file.mimetype : null,
    },
  });
  if (file) {
    await prisma.group.update({ where: { id: group.id }, data: { imageUrl: `/api/images/groups/${group.id}` } });
  }
  return prisma.group.findUnique({ where: { id: group.id }, select: PUBLIC_SELECT });
}

async function update(id, body, file) {
  const group = await prisma.group.findUnique({ where: { id } });
  if (!group) throw ApiError.notFound('Group not found');

  const data = {};
  if (body.name) data.name = body.name;
  if (body.isActive !== undefined) data.isActive = toBool(body.isActive);
  if (file) {
    data.imageData = file.buffer;
    data.imageMimeType = file.mimetype;
    data.imageUrl = `/api/images/groups/${id}`;
  }
  return prisma.group.update({ where: { id }, data, select: PUBLIC_SELECT });
}

module.exports = { listAll, listActive, create, update };
