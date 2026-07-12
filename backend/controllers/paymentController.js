const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;
    const razorpay = getRazorpay();

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency,
      receipt: orderId || `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    // Update order
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        'paymentInfo.razorpayOrderId': razorpay_order_id,
        'paymentInfo.razorpayPaymentId': razorpay_payment_id,
        'paymentInfo.razorpaySignature': razorpay_signature,
        'paymentInfo.status': 'paid',
        'paymentInfo.paidAt': new Date(),
        status: 'confirmed',
        $push: { tracking: { status: 'confirmed', description: 'Payment received. Order confirmed.' } },
      });
    }

    res.json({ success: true, message: 'Payment verified successfully.' });
  } catch (error) {
    next(error);
  }
};
