const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: Number,
      default: 60,
      comment: 'Duration in minutes',
    },
    category: {
      type: String,
      enum: ['hair', 'skin', 'makeup', 'nails', 'bridal', 'spa'],
      default: 'hair',
    },
    image: {
      type: String,
      default: '/images/services/default.jpg',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    staff: [
      {
        name: String,
        specialty: String,
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate slug from name
serviceSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
