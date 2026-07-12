import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ui/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const products = wishlist.products || [];

  return (
    <div className="container animate-fadeIn" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Wishlist</h1>

      {products.length === 0 ? (
        <div className="flex-center" style={{ minHeight: '50vh' }}>
          <div className="empty-state card-glass" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="empty-state__icon">❤️</div>
            <h2 className="empty-state__title">Your Wishlist is Empty</h2>
            <p className="empty-state__desc" style={{ marginBottom: '1.5rem' }}>
              Keep track of items you love by adding them to your wishlist.
            </p>
            <Link to="/products" className="btn btn-primary">
              Discover Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid-products">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
