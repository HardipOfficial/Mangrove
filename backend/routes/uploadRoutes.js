const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// @desc    Upload single image
// @route   POST /api/upload
// @access  Admin
router.post('/', protect, adminOnly, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const result = await uploadToCloudinary(req.file.buffer, 'mangrove');
    res.json({
      success: true,
      image: { public_id: result.public_id, url: result.secure_url },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Admin
router.post('/multiple', protect, adminOnly, upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }
    const uploadPromises = req.files.map(f => uploadToCloudinary(f.buffer, 'mangrove'));
    const results = await Promise.all(uploadPromises);
    const images = results.map(r => ({ public_id: r.public_id, url: r.secure_url }));
    res.json({ success: true, images });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
