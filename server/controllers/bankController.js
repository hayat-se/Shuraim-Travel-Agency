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

    const bankData = {
      bankName,
      accountTitle,
      accountNumber,
      iban: iban || null,
      branchName: branchName || null,
      branchCode: branchCode || null,
      branchAddress: branchAddress || null,
      city: city || null,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      createdBy: req.user?.id || null
    };

    if (req.file) {
      bankData.imageData = req.file.buffer;
      bankData.imageMimeType = req.file.mimetype;
    }

    const bank = await Bank.create(bankData);

    if (bank.imageData) {
      bank.imageUrl = `/api/images/banks/${bank.id}`;
      await bank.save();
    }

    const result = bank.toJSON();
    delete result.imageData;
    delete result.imageMimeType;

    res.status(201).json({ message: 'Bank created successfully', bank: result });
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

    const updates = {};
    if (req.body.bankName) updates.bankName = req.body.bankName;
    if (req.body.accountTitle) updates.accountTitle = req.body.accountTitle;
    if (req.body.accountNumber) updates.accountNumber = req.body.accountNumber;
    if (req.body.iban !== undefined) updates.iban = req.body.iban;
    if (req.body.branchName !== undefined) updates.branchName = req.body.branchName;
    if (req.body.branchCode !== undefined) updates.branchCode = req.body.branchCode;
    if (req.body.branchAddress !== undefined) updates.branchAddress = req.body.branchAddress;
    if (req.body.city !== undefined) updates.city = req.body.city;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

    if (req.file) {
      updates.imageData = req.file.buffer;
      updates.imageMimeType = req.file.mimetype;
      updates.imageUrl = `/api/images/banks/${bank.id}`;
    }

    await bank.update(updates);

    const result = bank.toJSON();
    delete result.imageData;
    delete result.imageMimeType;

    res.status(200).json({ message: 'Bank updated successfully', bank: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllBanks = async (req, res) => {
  try {
    const banks = await Bank.findAll({
      attributes: { exclude: ['imageData', 'imageMimeType'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(banks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveBanks = async (req, res) => {
  try {
    const banks = await Bank.findAll({
      attributes: { exclude: ['imageData', 'imageMimeType'] },
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
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
