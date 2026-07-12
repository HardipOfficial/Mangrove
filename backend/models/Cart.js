const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  image: String,
  price: Number,
  discountPrice: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
}, { timestamps: true });

cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((total, item) => {
    const price = item.discountPrice || item.price;
    return total + price * item.quantity;
  }, 0);
});

cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

module.exports = mongoose.model('Cart', cartSchema);
