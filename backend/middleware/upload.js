const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Upload to Cloudinary helper
const uploadToCloudinary = (buffer, folder = 'mangrove') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.error('Cloudinary delete error:', e.message);
  }
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
