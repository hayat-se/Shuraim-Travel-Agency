const { Group } = require('../config/database');

const createGroup = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const existing = await Group.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: 'Group name already exists' });
    }

    const imageUrl = req.file ? `/uploads/groups/${req.file.filename}` : null;

    const group = await Group.create({
      name,
      imageUrl,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      createdBy: req.user?.id || null
    });

    res.status(201).json({ message: 'Group created successfully', group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = `/uploads/groups/${req.file.filename}`;
    }

    await group.update(updates);
    res.status(200).json({ message: 'Group updated successfully', group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']] });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createGroup,
  updateGroup,
  getAllGroups,
  getActiveGroups
};
