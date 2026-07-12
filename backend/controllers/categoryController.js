const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const { active } = req.query;
    const query = {};
    if (active === 'true') query.isActive = true;
    const categories = await Category.find(query).populate('parent', 'name').sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name');
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (admin)
// @route   POST /api/categories
// @access  Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, parent } = req.body;
    let image = { public_id: '', url: '' };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'mangrove/categories');
      image = { public_id: result.public_id, url: result.secure_url };
    }

    const category = await Category.create({ name, description, parent: parent || null, image });
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (admin)
// @route   PUT /api/categories/:id
// @access  Admin
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    const { name, description, parent, isActive } = req.body;
    let image = category.image;

    if (req.file) {
      if (image.public_id) await deleteFromCloudinary(image.public_id);
      const result = await uploadToCloudinary(req.file.buffer, 'mangrove/categories');
      image = { public_id: result.public_id, url: result.secure_url };
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, parent: parent || null, image, isActive },
      { new: true, runValidators: true }
    );

    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (admin)
// @route   DELETE /api/categories/:id
// @access  Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    if (category.image.public_id) await deleteFromCloudinary(category.image.public_id);
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};
