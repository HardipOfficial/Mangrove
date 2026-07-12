const express = require('express');
const router = express.Router();
const { getReviews, addReview, deleteReview, markHelpful } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:productId', getReviews);
router.post('/:productId', protect, addReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, markHelpful);

module.exports = router;
