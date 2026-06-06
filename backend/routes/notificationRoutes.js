const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { protect, userOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, userOnly, getNotifications);
router.put('/read-all', protect, userOnly, markAllAsRead);
router.put('/:id/read', protect, userOnly, markAsRead);

module.exports = router;
