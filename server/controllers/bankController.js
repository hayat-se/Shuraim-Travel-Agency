const { Bank } = require('../config/database');

const createBank = async (req, res) => {
  try {
    const {
      bankName,
      accountTitle,
      accountNumber,
      iban,
      branchName,
      branchCode,
      branchAddress,
      city,
      isActive
    } = req.body;

    if (!bankName || !accountTitle || !accountNumber) {
      return res.status(400).json({ error: 'Bank name, account title, and account number are required' });
    }

    const imageUrl = req.file ? `/uploads/banks/${req.file.filename}` : null;

    const bank = await Bank.create({
      bankName,
      accountTitle,
      accountNumber,
      iban: iban || null,
      branchName: branchName || null,
      branchCode: branchCode || null,
      branchAddress: branchAddress || null,
      city: city || null,
      imageUrl,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      createdBy: req.user?.id || null
    });

    res.status(201).json({ message: 'Bank created successfully', bank });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBank = async (req, res) => {
  try {
    const { bankId } = req.params;
    const bank = await Bank.findByPk(bankId);

    if (!bank) {
      return res.status(404).json({ error: 'Bank not found' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = `/uploads/banks/${req.file.filename}`;
    }
    await bank.update(updates);

    res.status(200).json({ message: 'Bank updated successfully', bank });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllBanks = async (req, res) => {
  try {
    const banks = await Bank.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(banks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveBanks = async (req, res) => {
  try {
    const banks = await Bank.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']] });
    res.status(200).json(banks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBank = async (req, res) => {
  try {
    const { bankId } = req.params;
    const bank = await Bank.findByPk(bankId);

    if (!bank) {
      return res.status(404).json({ error: 'Bank not found' });
    }

    await bank.destroy();
    res.status(200).json({ message: 'Bank deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBank,
  updateBank,
  getAllBanks,
  getActiveBanks,
  deleteBank
};
