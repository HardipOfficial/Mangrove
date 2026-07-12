import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import StarRating from './StarRating';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const imageUrl = product.images?.[0]?.url || PLACEHOLDER;
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPct = product.discountPrice > 0
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to add to cart'); navigate('/login'); return; }
    await addToCart(product._id, 1);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to use wishlist'); navigate('/login'); return; }
    await toggleWishlist(product._id);
  };

  return (
    <div
      className="product-card animate-fadeIn"
      onClick={() => navigate(`/products/${product._id}`)}
      id={`product-card-${product._id}`}
      role="article"
      aria-label={product.name}
    >
      <div className="product-card__image-wrapper">
        <img src={imageUrl} alt={product.name} className="product-card__image" loading="lazy" />
        {discountPct > 0 && <span className="product-card__badge">{discountPct}% OFF</span>}
        <div className="product-card__actions">
          <button
            className={`product-card__action-btn ${inWishlist ? 'active' : ''}`}
            onClick={handleWishlist}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            id={`wishlist-btn-${product._id}`}
          >
            <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
          <button
            className="product-card__action-btn"
            onClick={handleAddToCart}
            title="Add to cart"
            id={`cart-btn-${product._id}`}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
      <div className="product-card__body">
        {product.brand && <p className="product-card__brand">{product.brand}</p>}
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__rating">
          <StarRating rating={product.ratings} size={14} />
          <span className="product-card__rating-value">({product.numReviews || 0})</span>
        </div>
        <div className="product-card__price">
          <span className="product-card__price-current">₹{effectivePrice.toLocaleString()}</span>
          {discountPct > 0 && (
            <>
              <span className="product-card__price-original">₹{product.price.toLocaleString()}</span>
              <span className="product-card__discount">{discountPct}% off</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
