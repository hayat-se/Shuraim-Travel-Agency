const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../api/index');
const { sendApprovalEmail, sendRejectionEmail, sendPasswordResetOtpEmail } = require('../services/emailService');

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;


    const { data: adminArr, error: adminErr } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .limit(1);
    const admin = adminArr && adminArr[0];
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
    const { data: existingAgencyArr, error: existingAgencyErr } = await supabase
      .from('agencies')
      .select('*')
      .eq('email', email)
      .limit(1);
    const existingAgency = existingAgencyArr && existingAgencyArr[0];
    if (existingAgency) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newAgency, error: createError } = await supabase
      .from('agencies')
      .insert([
        {
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
        }
      ])
      .select()
      .single();
    if (createError) throw createError;
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

    const { data: agencyArr, error: agencyErr } = await supabase
      .from('agencies')
      .select('*')
      .eq('email', email)
      .limit(1);
    const agency = agencyArr && agencyArr[0];
    if (!agency) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (agency && agency.status !== 'approved') {
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

const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

const requestAgencyPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data: agencyArr, error: agencyErr } = await supabase
      .from('agencies')
      .select('*')
      .eq('email', email)
      .limit(1);
    const agency = agencyArr && agencyArr[0];

    // Always respond success to avoid account enumeration
    if (!agency) {
      return res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await supabase
      .from('agencies')
      .update({ resetOtpHash: otpHash, resetOtpExpiresAt: expiresAt })
      .eq('id', agency.id);

    await sendPasswordResetOtpEmail(agency.agencyName, agency.email, otp);

    return res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetAgencyPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    const { data: agencyArr2, error: agencyErr2 } = await supabase
      .from('agencies')
      .select('*')
      .eq('email', email)
      .limit(1);
    const agency = agencyArr2 && agencyArr2[0];
    if (!agency || !agency.resetOtpHash || !agency.resetOtpExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    if (new Date() > new Date(agency.resetOtpExpiresAt)) {
      await agency.update({ resetOtpHash: null, resetOtpExpiresAt: null });
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    const isOtpValid = await bcrypt.compare(otp, agency.resetOtpHash);
    if (!isOtpValid) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await supabase
      .from('agencies')
      .update({ password: hashedPassword, resetOtpHash: null, resetOtpExpiresAt: null })
      .eq('id', agency.id);

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending agency requests (Admin only)
const getPendingAgencies = async (req, res) => {
  try {
    const { data: agencies, error: pendingErr } = await supabase
      .from('agencies')
      .select('*')
      .eq('status', 'pending');
    res.status(200).json(agencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all agencies (Admin only)
const getAllAgencies = async (req, res) => {
  try {
    const { data: agencies, error: allErr } = await supabase
      .from('agencies')
      .select('*');
    res.status(200).json(agencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve agency request (Admin only)
const approveAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    const { data: agencyArr3, error: agencyErr3 } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .limit(1);
    const agency = agencyArr3 && agencyArr3[0];
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    await supabase
      .from('agencies')
      .update({ status: 'approved', approvedAt: new Date(), approvedBy: req.user.id })
      .eq('id', agencyId);

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

    const { data: agencyArr4, error: agencyErr4 } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .limit(1);
    const agency = agencyArr4 && agencyArr4[0];
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    await supabase
      .from('agencies')
      .update({ status: 'rejected', rejectionReason: reason })
      .eq('id', agencyId);

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

    const { data: agencyArr5, error: agencyErr5 } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .limit(1);
    const agency = agencyArr5 && agencyArr5[0];
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    await supabase
      .from('agencies')
      .update({ status: 'blocked' })
      .eq('id', agencyId);

    res.status(200).json({
      message: 'Agency blocked',
      agency: agency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unblock agency (Admin only)
const unblockAgency = async (req, res) => {
  try {
    const { agencyId } = req.params;

    const { data: agencyArr6, error: agencyErr6 } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .limit(1);
    const agency = agencyArr6 && agencyArr6[0];
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    if (agency.status !== 'blocked') {
      return res.status(400).json({ error: 'Agency is not blocked' });
    }

    await supabase
      .from('agencies')
      .update({ status: 'approved' })
      .eq('id', agencyId);

    res.status(200).json({
      message: 'Agency unblocked successfully',
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
  requestAgencyPasswordReset,
  resetAgencyPassword,
  getPendingAgencies,
  getAllAgencies,
  approveAgency,
  rejectAgency,
  blockAgency,
  unblockAgency
};
