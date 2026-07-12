const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, changePassword, forgotPassword, resetPassword, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/refresh', refreshToken);

module.exports = router;
