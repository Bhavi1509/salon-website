const express = require('express');
const {
  getGallery,
  uploadImage,
  deleteImage,
  getAllGalleryAdmin,
} = require('../controllers/galleryController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getGallery);
router.get('/admin/all', protect, adminOnly, getAllGalleryAdmin);
router.post('/', protect, adminOnly, upload.single('image'), uploadImage);
router.delete('/:id', protect, adminOnly, deleteImage);

module.exports = router;
