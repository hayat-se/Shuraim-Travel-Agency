const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const env = require('../../config/env');
const ApiError = require('../../middleware/ApiError');
const {
  sendPasswordResetOtpEmail,
} = require('../../services/emailService');

function signToken(payload) {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

async function adminLogin({ email, password }) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    throw ApiError.badRequest('Invalid credentials');
  }
  const token = signToken({ id: admin.id, email: admin.email, role: admin.role });
  return {
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      companyName: admin.companyName,
    },
  };
}

async function agencyRegister(data) {
  const existing = await prisma.agency.findUnique({ where: { email: data.email } });
  if (existing) throw ApiError.badRequest('Email already registered');

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const agency = await prisma.agency.create({
    data: {
      agencyName: data.agencyName,
      email: data.email,
      password: hashedPassword,
      contactPerson: data.contactPerson,
      phone: data.phone,
      phone2: data.phone2,
      address: data.address,
      city: data.city,
      registrationNumber: data.registrationNumber,
      taxId: data.taxId,
      role: 'agency',
      status: 'pending',
    },
    select: { id: true },
  });
  return { agencyId: agency.id };
}

async function agencyLogin({ email, password }) {
  const agency = await prisma.agency.findUnique({ where: { email } });
  if (!agency) throw ApiError.badRequest('Invalid credentials');
  if (agency.status !== 'approved') {
    throw ApiError.forbidden(`Your account is ${agency.status}. Please wait for admin approval.`);
  }
  if (!(await bcrypt.compare(password, agency.password))) {
    throw ApiError.badRequest('Invalid credentials');
  }
  const token = signToken({ id: agency.id, email: agency.email, role: agency.role || 'agency' });
  return {
    token,
    user: {
      id: agency.id,
      agencyName: agency.agencyName,
      email: agency.email,
      role: agency.role || 'agency',
      city: agency.city,
      phone: agency.phone,
      contactPerson: agency.contactPerson,
    },
  };
}

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

async function requestAgencyPasswordReset({ email }) {
  const agency = await prisma.agency.findUnique({ where: { email } });
  // Always report success to prevent account enumeration.
  if (!agency) return;

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.agency.update({
    where: { id: agency.id },
    data: { resetOtpHash: otpHash, resetOtpExpiresAt: expiresAt },
  });
  await sendPasswordResetOtpEmail(agency.agencyName, agency.email, otp);
}

async function resetAgencyPassword({ email, otp, newPassword }) {
  const agency = await prisma.agency.findUnique({ where: { email } });
  if (!agency || !agency.resetOtpHash || !agency.resetOtpExpiresAt) {
    throw ApiError.badRequest('Invalid or expired OTP');
  }
  if (new Date() > new Date(agency.resetOtpExpiresAt)) {
    await prisma.agency.update({
      where: { id: agency.id },
      data: { resetOtpHash: null, resetOtpExpiresAt: null },
    });
    throw ApiError.badRequest('OTP expired. Please request a new one.');
  }
  if (!(await bcrypt.compare(otp, agency.resetOtpHash))) {
    throw ApiError.badRequest('Invalid OTP');
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.agency.update({
    where: { id: agency.id },
    data: { password: hashedPassword, resetOtpHash: null, resetOtpExpiresAt: null },
  });
}

module.exports = {
  adminLogin,
  agencyRegister,
  agencyLogin,
  requestAgencyPasswordReset,
  resetAgencyPassword,
};
