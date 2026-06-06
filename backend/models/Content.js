const mongoose = require('mongoose');

/**
 * CMS content for home page, contact info, and site settings
 */
const contentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    section: {
      type: String,
      enum: ['home', 'about', 'contact', 'settings'],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);
