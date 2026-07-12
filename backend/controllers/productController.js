const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      keyword, category, brand, minPrice, maxPrice,
      minRating, sort, page = 1, limit = 12, featured,
    } = req.query;

    const query = { isActive: true };

    // Search
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Filters
    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (featured === 'true') query.featured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minRating) query.ratings = { $gte: Number(minRating) };

    // Sort
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'rating') sortObj = { ratings: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { numReviews: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
// @access  Admin
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountPrice, brand, category, stock, tags, featured } = req.body;
    let images = [];

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'mangrove/products'));
      const results = await Promise.all(uploadPromises);
      images = results.map(r => ({ public_id: r.public_id, url: r.secure_url }));
    }

    // Parse images from JSON body (if sent as URLs)
    if (req.body.images) {
      try {
        const bodyImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        if (Array.isArray(bodyImages)) images = [...images, ...bodyImages];
      } catch (e) {}
    }

    const product = await Product.create({
      name, description, price, discountPrice, brand, category,
      stock, tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      featured: featured === 'true' || featured === true,
      images,
    });

    await product.populate('category', 'name slug');
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const { name, description, price, discountPrice, brand, category, stock, tags, featured, isActive } = req.body;
    let images = product.images;

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'mangrove/products'));
      const results = await Promise.all(uploadPromises);
      const newImages = results.map(r => ({ public_id: r.public_id, url: r.secure_url }));
      images = [...images, ...newImages];
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name, description, price, discountPrice, brand, category,
        stock, images,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : product.tags,
        featured: featured !== undefined ? (featured === 'true' || featured === true) : product.featured,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : product.isActive,
      },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    // Delete images from Cloudinary
    for (const img of product.images) {
      await deleteFromCloudinary(img.public_id);
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Admin
exports.deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const image = product.images.find(img => img._id.toString() === req.params.imageId);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found.' });

    await deleteFromCloudinary(image.public_id);
    product.images = product.images.filter(img => img._id.toString() !== req.params.imageId);
    await product.save();
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get brands
// @route   GET /api/products/brands
// @access  Public
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true, brand: { $ne: '' } });
    res.json({ success: true, brands: brands.sort() });
  } catch (error) {
    next(error);
  }
};
