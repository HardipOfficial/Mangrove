import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Loader from '../components/ui/Loader';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, loading, updateQuantity, removeFromCart, clearCart } = useCart();

  if (loading) return <Loader />;

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh' }}>
        <div className="empty-state card-glass" style={{ maxWidth: '480px', width: '100%' }}>
          <div className="empty-state__icon">🛒</div>
          <h2 className="empty-state__title">Your Cart is Empty</h2>
          <p className="empty-state__desc" style={{ marginBottom: '1.5rem' }}>
            Add some amazing products to your cart and make them yours!
          </p>
          <Link to="/products" className="btn btn-primary">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  const handleQtyChange = (productId, quantity, stock) => {
    if (quantity < 1) return;
    if (quantity > stock) return;
    updateQuantity(productId, quantity);
  };

  return (
    <div className="container animate-fadeIn" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Shopping Cart</h1>

      <div className="checkout-layout">
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="flex-between" style={{ padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {items.reduce((acc, i) => acc + i.quantity, 0)} Items
            </span>
            <button
              onClick={clearCart}
              style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600 }}
              id="clear-cart-btn"
            >
              Clear Cart
            </button>
          </div>

          {items.map((item) => {
            const product = item.product || {};
            const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
            return (
              <div key={item.product?._id || item._id} className="cart-item">
                <img
                  src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'}
                  alt={product.name}
                  className="cart-item__img"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <Link to={`/products/${product._id}`} className="cart-item__name" style={{ color: 'var(--text-primary)' }}>
                    {product.name}
                  </Link>
                  {product.brand && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Brand: {product.brand}</span>
                  )}
                  <span className="cart-item__price">₹{itemPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div className="qty-control" style={{ background: 'var(--bg-elevated)', padding: '0.2rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
                    <button
                      className="qty-btn"
                      onClick={() => handleQtyChange(product._id, item.quantity - 1, product.stock)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQtyChange(product._id, item.quantity + 1, product.stock)}
                      disabled={item.quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="qty-btn"
                    style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Checkout Card */}
        <div className="order-summary">
          <h3 className="order-summary__title">Order Summary</h3>
          <div className="order-summary__item">
            <span>Subtotal</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
          <div className="order-summary__item">
            <span>Shipping</span>
            <span>{totalPrice >= 500 ? 'FREE' : '₹50'}</span>
          </div>
          <div className="order-summary__item">
            <span>Estimated Tax (18% GST)</span>
            <span>₹{Math.round(totalPrice * 0.18).toLocaleString()}</span>
          </div>
          <div className="order-summary__total">
            <span>Total</span>
            <span className="order-summary__total-value">
              ₹{(totalPrice + (totalPrice >= 500 ? 0 : 50) + Math.round(totalPrice * 0.18)).toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-full flex-center gap-1"
            style={{ marginTop: '1.5rem' }}
            id="proceed-checkout-btn"
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
