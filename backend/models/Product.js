const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    default: 0,
  },
  brand: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  images: [
    {
      public_id: { type: String, default: '' },
      url: { type: String, required: true },
    },
  ],
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  tags: [{ type: String, trim: true }],
  featured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Auto-generate slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ price: 1, ratings: -1, category: 1 });

module.exports = mongoose.model('Product', productSchema);
