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

    const airlineData = {
      name,
      code: code || null,
      isActive: true,
      createdBy: req.user?.id || null
    };

    if (req.file) {
      airlineData.logoData = req.file.buffer;
      airlineData.logoMimeType = req.file.mimetype;
    }

    const airline = await Airline.create(airlineData);

    if (airline.logoData) {
      airline.logoUrl = `/api/images/airlines/${airline.id}`;
      await airline.save();
    }

    const result = airline.toJSON();
    delete result.logoData;
    delete result.logoMimeType;

    res.status(201).json({ message: 'Airline created successfully', airline: result });
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

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.code !== undefined) updates.code = req.body.code;
    if (req.body.isActive !== undefined) {
      updates.isActive = typeof req.body.isActive === 'string' ? req.body.isActive === 'true' : req.body.isActive;
    }

    if (req.file) {
      updates.logoData = req.file.buffer;
      updates.logoMimeType = req.file.mimetype;
      updates.logoUrl = `/api/images/airlines/${airline.id}`;
    }

    await airline.update(updates);

    const result = airline.toJSON();
    delete result.logoData;
    delete result.logoMimeType;

    res.status(200).json({ message: 'Airline updated successfully', airline: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllAirlines = async (req, res) => {
  try {
    const airlines = await Airline.findAll({
      attributes: { exclude: ['logoData', 'logoMimeType'] },
      order: [['name', 'ASC']]
    });
    res.status(200).json(airlines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveAirlines = async (req, res) => {
  try {
    const airlines = await Airline.findAll({
      attributes: { exclude: ['logoData', 'logoMimeType'] },
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
