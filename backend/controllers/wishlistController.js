const Wishlist = require('../models/Wishlist');

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'name images price discountPrice ratings numReviews isActive brand');
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    wishlist.products = wishlist.products.filter(p => p && p.isActive);
    res.json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

    const idx = wishlist.products.indexOf(productId);
    let added;
    if (idx > -1) {
      wishlist.products.splice(idx, 1);
      added = false;
    } else {
      wishlist.products.push(productId);
      added = true;
    }

    await wishlist.save();
    res.json({ success: true, added, message: added ? 'Added to wishlist.' : 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found.' });
    wishlist.products = wishlist.products.filter(p => p.toString() !== req.params.productId);
    await wishlist.save();
    res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
};
