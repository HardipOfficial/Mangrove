const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images price discountPrice stock isActive');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    // Filter out inactive/deleted products
    cart.items = cart.items.filter(item => item.product && item.product.isActive);

    const totalPrice = cart.items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    res.json({ success: true, cart, totalPrice });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      const newQty = existingItem.quantity + Number(quantity);
      if (product.stock < newQty) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} items available.` });
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        discountPrice: product.discountPrice,
        quantity: Number(quantity),
      });
    }

    await cart.save();
    res.json({ success: true, message: 'Added to cart.', itemCount: cart.items.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const product = await Product.findById(req.params.productId);
    if (product && product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock.` });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart.' });

    item.quantity = Number(quantity);
    await cart.save();
    res.json({ success: true, message: 'Cart updated.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });
    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, message: 'Item removed from cart.', itemCount: cart.items.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) { cart.items = []; await cart.save(); }
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    next(error);
  }
};
