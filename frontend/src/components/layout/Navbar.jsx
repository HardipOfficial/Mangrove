import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, LogOut, Settings, Package, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" id="navbar-logo">🌿 Mangrove</Link>

        {/* Search */}
        <form className="navbar__search" onSubmit={handleSearch} role="search">
          <Search size={16} className="navbar__search-icon" />
          <input
            className="navbar__search-input"
            type="search"
            placeholder="Search products, brands..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="navbar-search-input"
            aria-label="Search products"
          />
        </form>

        {/* Actions */}
        <div className="navbar__actions">
          {isAuthenticated && (
            <>
              <Link to="/wishlist" className="navbar__icon-btn" title="Wishlist" id="navbar-wishlist-btn" aria-label="Wishlist">
                <Heart size={20} />
              </Link>
              <Link to="/cart" className="navbar__icon-btn" title="Cart" id="navbar-cart-btn" aria-label="Cart">
                <ShoppingCart size={20} />
                {itemCount > 0 && <span className="navbar__badge">{itemCount > 9 ? '9+' : itemCount}</span>}
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="navbar__user-menu" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="navbar-user-btn"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <img
                  src={user?.avatar?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                  alt={user?.name}
                  className="navbar__user-avatar"
                />
              </button>
              {dropdownOpen && (
                <div className="navbar__dropdown" id="navbar-dropdown">
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.email}</p>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)} id="nav-admin-link">
                      <LayoutDashboard size={16} /> Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)} id="nav-profile-link">
                    <Settings size={16} /> Profile
                  </Link>
                  <Link to="/orders" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)} id="nav-orders-link">
                    <Package size={16} /> My Orders
                  </Link>
                  <div className="navbar__dropdown-divider" />
                  <button className="navbar__dropdown-item danger" onClick={handleLogout} id="nav-logout-btn" style={{ width: '100%', textAlign: 'left' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="navbar-login-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
