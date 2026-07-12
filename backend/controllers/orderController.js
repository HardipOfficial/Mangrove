const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const sendEmail = require('../utils/sendEmail');

// @desc    Place order
// @route   POST /api/orders
// @access  Private
exports.placeOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'cod', notes } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // Validate stock
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${item.name} is no longer available.` });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${item.product.name}.` });
      }
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0]?.url || '',
      price: item.product.discountPrice || item.product.price,
      quantity: item.quantity,
    }));

    const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingPrice = itemsPrice >= 500 ? 0 : 50;
    const taxPrice = Math.round(itemsPrice * 0.18);
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentInfo: { method: paymentMethod, status: paymentMethod === 'cod' ? 'pending' : 'pending' },
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      notes,
      tracking: [{ status: 'pending', description: 'Order placed successfully.' }],
    });

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send confirmation email
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Order Confirmed - ${order.orderNumber}`,
        html: `<h2>Order Confirmed!</h2><p>Your order #${order.orderNumber} has been placed. Total: ₹${totalPrice}</p>`,
      });
    } catch (e) {}

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments({ user: req.user._id }),
    ]);
    res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });
    }
    order.status = 'cancelled';
    order.tracking.push({ status: 'cancelled', description: 'Order cancelled by customer.' });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    res.json({ success: true, order, message: 'Order cancelled.' });
  } catch (error) {
    next(error);
  }
};

// ADMIN CONTROLLERS

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ success: true, orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, description, location } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    order.tracking.push({
      status,
      description: description || `Order status updated to ${status}`,
      location: location || '',
    });

    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentInfo.status = 'paid';
      order.paymentInfo.paidAt = new Date();
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
