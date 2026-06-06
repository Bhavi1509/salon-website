const express = require('express');
const {
  getUsers,
  getUserById,
  updateProfile,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, adminOnly, userOnly } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', protect, userOnly, updateProfile);
router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
