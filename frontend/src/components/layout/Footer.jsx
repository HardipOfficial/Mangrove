import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__logo">🌿 Mangrove</div>
            <p className="footer__desc">
              Your premier destination for quality products. Shop with confidence — fast delivery, easy returns, and unbeatable prices.
            </p>
          </div>
          <div>
            <h4 className="footer__heading">Shop</h4>
            <Link to="/products" className="footer__link">All Products</Link>
            <Link to="/products?featured=true" className="footer__link">Featured</Link>
            <Link to="/products?sort=newest" className="footer__link">New Arrivals</Link>
            <Link to="/products?sort=popular" className="footer__link">Best Sellers</Link>
          </div>
          <div>
            <h4 className="footer__heading">Account</h4>
            <Link to="/profile" className="footer__link">My Profile</Link>
            <Link to="/orders" className="footer__link">My Orders</Link>
            <Link to="/wishlist" className="footer__link">Wishlist</Link>
            <Link to="/addresses" className="footer__link">Addresses</Link>
          </div>
          <div>
            <h4 className="footer__heading">Support</h4>
            <span className="footer__link" style={{ cursor: 'default' }}>Help Center</span>
            <span className="footer__link" style={{ cursor: 'default' }}>Returns Policy</span>
            <span className="footer__link" style={{ cursor: 'default' }}>Privacy Policy</span>
            <span className="footer__link" style={{ cursor: 'default' }}>Terms of Service</span>
          </div>
        </div>
        <div className="footer__bottom">
          <p className="footer__copy">© {new Date().getFullYear()} Mangrove. All rights reserved.</p>
          <p className="footer__copy">Made with 💚 by the Mangrove team</p>
        </div>
      </div>
    </footer>
  );
}
