const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authMiddleware, adminOnly, agencyOnly } = require('../middleware/auth');
const { createUploader } = require('../middleware/upload');

const uploadGroupImage = createUploader('groups');

// Agency: get active groups
router.get('/', authMiddleware, agencyOnly, groupController.getActiveGroups);

// Admin: manage groups
router.get('/admin', authMiddleware, adminOnly, groupController.getAllGroups);
router.post('/admin', authMiddleware, adminOnly, uploadGroupImage.single('image'), groupController.createGroup);
router.put('/admin/:groupId', authMiddleware, adminOnly, uploadGroupImage.single('image'), groupController.updateGroup);

module.exports = router;
