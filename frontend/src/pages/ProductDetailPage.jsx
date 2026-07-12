import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, RotateCcw, ChevronLeft, ChevronRight, Send, Trash2, ThumbsUp } from 'lucide-react';
import api from '../api/axios';
import StarRating from '../components/ui/StarRating';
import Loader from '../components/ui/Loader';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/${id}`),
        ]);
        setProduct(prodRes.data.product);
        setReviews(revRes.data.reviews);
      } catch (err) {
        toast.error('Product not found or error loading product details');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id, navigate]);

  if (loading) return <Loader />;
  if (!product) return null;

  const images = product.images || [];
  const mainImage = images[activeImageIndex]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop';
  const inWishlist = isInWishlist(product._id);
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to your cart');
      navigate('/login');
      return;
    }
    await addToCart(product._id, quantity);
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to update your wishlist');
      navigate('/login');
      return;
    }
    await toggleWishlist(product._id);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/reviews/${product._id}`, {
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      toast.success(data.message || 'Review submitted successfully');

      // Refresh reviews list
      const revRes = await api.get(`/reviews/${product._id}`);
      setReviews(revRes.data.reviews);

      // Reset review form
      setReviewTitle('');
      setReviewComment('');
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        setReviews(reviews.filter((r) => r._id !== reviewId));
        toast.success('Review deleted');
      } catch (err) {
        toast.error('Failed to delete review');
      }
    }
  };

  const handleHelpfulClick = async (reviewId) => {
    try {
      const { data } = await api.put(`/reviews/${reviewId}/helpful`);
      // Update local reviews list helpful counts
      setReviews(
        reviews.map((r) => {
          if (r._id === reviewId) {
            const hasMarked = r.helpful.includes(user?._id);
            const nextHelpful = hasMarked
              ? r.helpful.filter((id) => id !== user?._id)
              : [...r.helpful, user?._id];
            return { ...r, helpful: nextHelpful };
          }
          return r;
        })
      );
    } catch {}
  };

  return (
    <div className="container animate-fadeIn" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Product top section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        {/* Images gallery */}
        <div>
          <div className="card-glass" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <img src={mainImage} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
            {images.length > 1 && (
              <>
                <button
                  className="qty-btn"
                  style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)' }}
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className="qty-btn"
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)' }}
                  onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', padding: '0.2rem' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    width: '64px',
                    height: '64px',
                    border: activeImageIndex === idx ? '2px solid var(--accent)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'var(--bg-secondary)',
                  }}
                  id={`thumbnail-${idx}`}
                >
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            {product.brand && (
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {product.brand}
              </span>
            )}
            <h1 style={{ fontSize: '2rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StarRating rating={product.ratings} size={18} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{product.ratings}</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{product.numReviews} Reviews</span>
            </div>
          </div>

          <div className="divider" style={{ margin: 0 }} />

          {/* Pricing */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <span className="price-tag">₹{effectivePrice.toLocaleString()}</span>
              {product.discountPrice > 0 && (
                <>
                  <span className="price-tag--original">₹{product.price.toLocaleString()}</span>
                  <span className="badge badge-warning" style={{ fontSize: '0.85rem' }}>
                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: isOutOfStock ? 'var(--danger)' : 'var(--accent)', marginTop: '0.5rem', fontWeight: 600 }}>
              {isOutOfStock ? 'Out of Stock' : product.stock < 10 ? `Only ${product.stock} left in stock!` : 'In Stock'}
            </p>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>Product Description</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {product.description}
            </p>
          </div>

          {/* Add to Cart Controls */}
          {!isOutOfStock && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Quantity:</span>
              <div className="qty-control" style={{ background: 'var(--bg-elevated)', padding: '0.25rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  id="qty-minus"
                >
                  -
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  id="qty-plus"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              id="detail-add-to-cart-btn"
            >
              <ShoppingCart size={18} /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              className={`btn btn-outline btn-lg ${inWishlist ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              id="detail-wishlist-btn"
              title="Wishlist"
              style={{ color: inWishlist ? 'var(--danger)' : '', borderColor: inWishlist ? 'var(--danger)' : '' }}
            >
              <Heart size={18} fill={inWishlist ? 'var(--danger)' : 'none'} />
            </button>
          </div>

          {/* Extra benefits */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="card-glass" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius)', alignItems: 'center' }}>
              <Shield size={16} style={{ color: 'var(--accent)' }} />
              <div style={{ fontSize: '0.8rem' }}>
                <p style={{ fontWeight: 600 }}>1 Year Warranty</p>
                <p style={{ color: 'var(--text-muted)' }}>Genuine brand cover</p>
              </div>
            </div>
            <div className="card-glass" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius)', alignItems: 'center' }}>
              <RotateCcw size={16} style={{ color: 'var(--accent)' }} />
              <div style={{ fontSize: '0.8rem' }}>
                <p style={{ fontWeight: 600 }}>30 Days Returns</p>
                <p style={{ color: 'var(--text-muted)' }}>Hassle free replacement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Reviews & Ratings section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
        {/* Submit Review */}
        <div>
          <h3 style={{ marginBottom: '1.25rem' }}>Write a Review</h3>
          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }} id="review-form">
              <div className="form-group">
                <span className="form-label">Rating</span>
                <StarRating rating={rating} size={22} interactive={true} onRate={setRating} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="review-title">Title</label>
                <input
                  type="text"
                  id="review-title"
                  className="form-input"
                  placeholder="Summarize your experience..."
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="review-comment">Review Content</label>
                <textarea
                  id="review-comment"
                  className="form-textarea"
                  placeholder="What did you like or dislike? How was the quality?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full flex-center gap-1"
                disabled={submittingReview}
                id="submit-review-btn"
              >
                <Send size={16} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="card-glass" style={{ padding: '2rem 1.5rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Please log in to write reviews for this product.</p>
              <button onClick={() => navigate('/login')} className="btn btn-outline btn-sm">Log In</button>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div>
          <h3 style={{ marginBottom: '1.25rem' }}>Customer Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <div style={{ padding: '2rem 0', color: 'var(--text-muted)' }}>
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reviews.map((rev) => (
                <div key={rev._id} className="card-glass animate-fadeIn" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
                  <div className="flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={rev.user?.avatar?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${rev.user?.name}`}
                        alt={rev.user?.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rev.user?.name || 'Anonymous'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {/* Delete review if it belongs to user or user is admin */}
                    {(user?._id === rev.user?._id || user?.role === 'admin') && (
                      <button
                        onClick={() => handleReviewDelete(rev._id)}
                        className="qty-btn"
                        title="Delete review"
                        style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0 0.5rem' }}>
                    <StarRating rating={rev.rating} size={14} />
                    {rev.title && <h5 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{rev.title}</h5>}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{rev.comment}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button
                      className="btn btn-ghost btn-sm flex-center gap-1"
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
                      onClick={() => handleHelpfulClick(rev._id)}
                    >
                      <ThumbsUp size={12} /> Helpful ({rev.helpful?.length || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
