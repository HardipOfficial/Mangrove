const Address = require('../models/Address');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, country, type, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      name, phone, line1, line2, city, state, pincode,
      country: country || 'India', type: type || 'home',
      isDefault: isDefault || false,
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, address: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    await address.deleteOne();
    res.json({ success: true, message: 'Address deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private
exports.setDefault = async (req, res, next) => {
  try {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await Address.findByIdAndUpdate(req.params.id, { isDefault: true }, { new: true });
    res.json({ success: true, address });
  } catch (error) {
    next(error);
  }
};
