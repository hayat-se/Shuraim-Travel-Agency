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

    const groupData = {
      name,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      createdBy: req.user?.id || null
    };

    if (req.file) {
      groupData.imageData = req.file.buffer;
      groupData.imageMimeType = req.file.mimetype;
    }

    const group = await Group.create(groupData);

    // Set imageUrl to the serving endpoint
    if (group.imageData) {
      group.imageUrl = `/api/images/groups/${group.id}`;
      await group.save();
    }

    // Return without blob data
    const result = group.toJSON();
    delete result.imageData;
    delete result.imageMimeType;

    res.status(201).json({ message: 'Group created successfully', group: result });
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

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

    if (req.file) {
      updates.imageData = req.file.buffer;
      updates.imageMimeType = req.file.mimetype;
      updates.imageUrl = `/api/images/groups/${group.id}`;
    }

    await group.update(updates);

    const result = group.toJSON();
    delete result.imageData;
    delete result.imageMimeType;

    res.status(200).json({ message: 'Group updated successfully', group: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      attributes: { exclude: ['imageData', 'imageMimeType'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      attributes: { exclude: ['imageData', 'imageMimeType'] },
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
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
