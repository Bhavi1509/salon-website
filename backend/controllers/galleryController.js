const Gallery = require('../models/Gallery');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Get gallery images (public)
 * @route   GET /api/gallery
 */
exports.getGallery = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    const images = await Gallery.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload gallery image (admin)
 * @route   POST /api/gallery
 */
exports.uploadImage = async (req, res, next) => {
  try {
    const { title, category, description } = req.body;

    let imageUrl = req.body.imageUrl;

    // If file uploaded, push to Cloudinary and remove local file
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'glow-grace/gallery',
        resource_type: 'image',
      });
      imageUrl = result.secure_url;
      var cloudinaryId = result.public_id;

      // remove local file
      fs.unlink(filePath, (err) => {
        if (err) console.warn('Failed to remove local upload:', err.message || err);
      });
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const image = await Gallery.create({ title, category, description, imageUrl, cloudinaryId });
    res.status(201).json({ success: true, message: 'Image uploaded', data: image });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete gallery image (admin)
 * @route   DELETE /api/gallery/:id
 */
exports.deleteImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Remove from Cloudinary if stored
    if (image.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(image.cloudinaryId, { resource_type: 'image' });
      } catch (err) {
        console.warn('Failed to remove image from Cloudinary:', err.message || err);
      }
    }

    await image.deleteOne();
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all gallery images including inactive (admin)
 * @route   GET /api/gallery/admin/all
 */
exports.getAllGalleryAdmin = async (req, res, next) => {
  try {
    const images = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (error) {
    next(error);
  }
};
