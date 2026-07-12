const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalProducts, totalOrders, totalCategories,
      recentOrders, revenueData, lowStockProducts, orderStatusCounts,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Category.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
      Order.aggregate([
        { $match: { 'paymentInfo.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      ]),
      Product.find({ stock: { $lt: 10 }, isActive: true }).select('name stock images').limit(10),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const paidOrders = revenueData[0]?.count || 0;

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, 'paymentInfo.status': 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalProducts, totalOrders, totalCategories,
        totalRevenue, paidOrders,
      },
      recentOrders,
      lowStockProducts,
      orderStatusCounts,
      monthlyRevenue,
    });
  } catch (error) {
    next(error);
  }
};
