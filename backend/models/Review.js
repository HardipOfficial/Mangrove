const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  images: [{ type: String }],
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product rating after save
reviewSchema.post('save', async function () {
  const Product = require('./Product');
  const stats = await this.constructor.aggregate([
    { $match: { product: this.product } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      ratings: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].count,
    });
  }
});

// Update product rating after remove
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    const Product = require('./Product');
    const stats = await doc.constructor.aggregate([
      { $match: { product: doc.product } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(doc.product, {
        ratings: Math.round(stats[0].avgRating * 10) / 10,
        numReviews: stats[0].count,
      });
    } else {
      await Product.findByIdAndUpdate(doc.product, { ratings: 0, numReviews: 0 });
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);
