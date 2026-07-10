/* eslint-disable no-console */
// Seed a super-admin account. Run once after the DB is reachable:
//   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='StrongPass!' npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@shuraim.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const name = process.env.SEED_ADMIN_NAME || 'Super Admin';

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists — skipping.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { name, email, password: hashed, role: 'super_admin', companyName: 'Shuraim Travel Agency' },
  });
  console.log(`Created super-admin: ${admin.email} (id=${admin.id})`);
  console.log('IMPORTANT: change this password after first login.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
