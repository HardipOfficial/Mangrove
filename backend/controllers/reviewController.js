const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update review
// @route   POST /api/reviews/:productId
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Check if user purchased this product
    // const hasPurchased = await Order.findOne({ user: req.user._id, 'items.product': productId, status: 'delivered' });
    // if (!hasPurchased) return res.status(403).json({ success: false, message: 'You can only review products you have purchased.' });

    const existingReview = await Review.findOne({ user: req.user._id, product: productId });
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.title = title;
      existingReview.comment = comment;
      await existingReview.save();
      return res.json({ success: true, review: existingReview, message: 'Review updated.' });
    }

    const review = await Review.create({ user: req.user._id, product: productId, rating, title, comment });
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    const idx = review.helpful.indexOf(req.user._id);
    if (idx > -1) {
      review.helpful.splice(idx, 1);
    } else {
      review.helpful.push(req.user._id);
    }
    await review.save();
    res.json({ success: true, helpfulCount: review.helpful.length });
  } catch (error) {
    next(error);
  }
};
