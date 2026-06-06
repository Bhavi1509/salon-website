const express = require('express');
const {
  getContent,
  getAllContent,
  updateContent,
  submitContact,
} = require('../controllers/contentController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/contact', submitContact);
router.get('/:section', getContent);
router.get('/', protect, adminOnly, getAllContent);
router.put('/', protect, adminOnly, updateContent);

module.exports = router;
