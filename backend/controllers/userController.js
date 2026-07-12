const User = require('../models/User');

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Admin
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ success: true, users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user (admin)
// @route   GET /api/users/:id
// @access  Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (admin)
// @route   PUT /api/users/:id
// @access  Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive } = req.body;
    
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent admins from demoting themselves or deactivating themselves
    if (req.params.id === req.user._id.toString()) {
      if (role && role !== 'admin' && targetUser.role === 'admin') {
        return res.status(400).json({ success: false, message: 'You cannot demote yourself from the admin role.' });
      }
      if (isActive === false || isActive === 'false') {
        return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account.' });
      }
    }

    // Prevent any admin demotion or deactivation
    if (targetUser.role === 'admin') {
      if (role && role !== 'admin') {
        return res.status(400).json({ success: false, message: 'Admin accounts cannot be demoted to user role.' });
      }
      if (isActive === false || isActive === 'false') {
        return res.status(400).json({ success: false, message: 'Admin accounts cannot be deactivated.' });
      }
    }

    targetUser.name = name || targetUser.name;
    targetUser.email = email || targetUser.email;
    if (role !== undefined) targetUser.role = role;
    if (isActive !== undefined) targetUser.isActive = isActive === 'true' || isActive === true;

    await targetUser.save();
    res.json({ success: true, user: targetUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin user.' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};
