const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, Agency, AuditLog } = require('../config/database');
const { sendApprovalEmail, sendRejectionEmail } = require('../services/emailService');

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        companyName: admin.companyName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agency Registration (Request Account)
const agencyRegister = async (req, res) => {
  try {
    const {
      agencyName,
      email,
      password,
      contactPerson,
      phone,
      phone2,
      address,
      city,
      registrationNumber,
      taxId
    } = req.body;

    // Check if agency already exists
    const existingAgency = await Agency.findOne({ where: { email } });
    if (existingAgency) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgency = await Agency.create({
      agencyName,
      email,
      password: hashedPassword,
      contactPerson,
      phone,
      phone2,
      address,
      city,
      registrationNumber,
      taxId,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Agency registration request submitted. Please wait for admin approval.',
      agencyId: newAgency.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agency Login
const agencyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const agency = await Agency.findOne({ where: { email } });
    if (!agency) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (agency.status !== 'approved') {
      return res.status(403).json({ error: `Your account is ${agency.status}. Please wait for admin approval.` });
    }

    const isPasswordValid = await bcrypt.compare(password, agency.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: agency.id, email: agency.email, role: agency.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: agency.id,
        agencyName: agency.agencyName,
        email: agency.email,
        role: agency.role,
        city: agency.city
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending agency requests (Admin only)
const getPendingAgencies = async (req, res) => {
  try {
    const agencies = await Agency.findAll({ where: { status: 'pending' } });
    res.status(200).json(agencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all agencies (Admin only)
const getAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.findAll();
    res.status(200).json(agencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve agency request (Admin only)
const approveAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    const agency = await Agency.findByPk(agencyId);
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    await agency.update({
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: req.user.id
    });

    // Send approval email
    await sendApprovalEmail(agency.agencyName, agency.email);

    res.status(200).json({
      message: 'Agency approved successfully',
      agency: agency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject agency request (Admin only)
const rejectAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const { reason } = req.body;

    const agency = await Agency.findByPk(agencyId);
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    await agency.update({
      status: 'rejected',
      rejectionReason: reason
    });

    // Send rejection email
    await sendRejectionEmail(agency.agencyName, agency.email, reason);

    res.status(200).json({
      message: 'Agency rejected',
      agency: agency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Block agency (Admin only)
const blockAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    const agency = await Agency.findByPk(agencyId);
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    await agency.update({ status: 'blocked' });

    res.status(200).json({
      message: 'Agency blocked',
      agency: agency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  adminLogin,
  agencyRegister,
  agencyLogin,
  getPendingAgencies,
  getAllAgencies,
  approveAgency,
  rejectAgency,
  blockAgency
};
