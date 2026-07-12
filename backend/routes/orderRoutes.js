const express = require('express');
const router = express.Router();
const {
  placeOrder, getUserOrders, getOrder, cancelOrder,
  getAllOrders, updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.post('/', placeOrder);
router.get('/', getUserOrders);
router.get('/admin/all', adminOnly, getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', adminOnly, updateOrderStatus);

module.exports = router;
