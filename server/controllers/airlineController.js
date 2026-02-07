const { Airline } = require('../config/database');

const createAirline = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Airline name is required' });
    }

    const existing = await Airline.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Airline with this name already exists' });
    }

    const logoUrl = req.file ? `/uploads/airlines/${req.file.filename}` : null;

    const airline = await Airline.create({
      name,
      code: code || null,
      logoUrl,
      isActive: true,
      createdBy: req.user?.id || null
    });

    res.status(201).json({ message: 'Airline created successfully', airline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAirline = async (req, res) => {
  try {
    const { airlineId } = req.params;
    const airline = await Airline.findByPk(airlineId);

    if (!airline) {
      return res.status(404).json({ error: 'Airline not found' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.logoUrl = `/uploads/airlines/${req.file.filename}`;
    }

    // Handle isActive string → boolean
    if (typeof updates.isActive === 'string') {
      updates.isActive = updates.isActive === 'true';
    }

    await airline.update(updates);
    res.status(200).json({ message: 'Airline updated successfully', airline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllAirlines = async (req, res) => {
  try {
    const airlines = await Airline.findAll({ order: [['name', 'ASC']] });
    res.status(200).json(airlines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveAirlines = async (req, res) => {
  try {
    const airlines = await Airline.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    res.status(200).json(airlines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAirline = async (req, res) => {
  try {
    const { airlineId } = req.params;
    const airline = await Airline.findByPk(airlineId);

    if (!airline) {
      return res.status(404).json({ error: 'Airline not found' });
    }

    await airline.destroy();
    res.status(200).json({ message: 'Airline deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAirline,
  updateAirline,
  getAllAirlines,
  getActiveAirlines,
  deleteAirline
};
