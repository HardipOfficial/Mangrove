const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, deleteProductImage, getBrands,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/brands', getBrands);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, adminOnly, upload.array('images', 10), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.delete('/:id/images/:imageId', protect, adminOnly, deleteProductImage);

module.exports = router;
