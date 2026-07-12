import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';
import Loader from '../components/ui/Loader';

const FEATURES = [
  { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On orders over ₹500' },
  { icon: <ShieldCheck size={24} />, title: 'Secure Payments', desc: 'Razorpay powered' },
  { icon: <RotateCcw size={24} />, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: <Zap size={24} />, title: 'Fast Delivery', desc: '2-5 business days' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, categoryRes, newRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/categories?active=true'),
          api.get('/products?sort=newest&limit=8'),
        ]);
        setFeaturedProducts(featuredRes.data.products);
        setCategories(categoryRes.data.categories.slice(0, 8));
        setNewArrivals(newRes.data.products);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn" id="home-page">
      {/* Hero */}
      <section className="hero" id="hero-section">
        <div className="container">
          <div className="hero__content">
            <div className="hero__eyebrow">
              <Zap size={12} /> New Collection 2026
            </div>
            <h1 className="hero__title">
              Shop the Future,<br /><span>Delivered Today</span>
            </h1>
            <p className="hero__desc">
              Discover thousands of premium products across all categories. Unbeatable prices, lightning-fast delivery, and a shopping experience that feels like the future.
            </p>
            <div className="hero__actions">
              <Link to="/products" className="btn btn-primary btn-lg" id="hero-shop-btn">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/products?featured=true" className="btn btn-ghost btn-lg" id="hero-featured-btn">
                View Featured
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'var(--bg-secondary)', padding: '2rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ color: 'var(--accent)', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{f.title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section" id="categories-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Shop by Category</h2>
                <p className="section-subtitle">Find exactly what you're looking for</p>
              </div>
              <Link to="/products" className="btn btn-ghost btn-sm" id="all-categories-link">View All</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {categories.map(cat => (
                <div
                  key={cat._id}
                  className="category-card"
                  onClick={() => navigate(`/products?category=${cat._id}`)}
                  id={`category-card-${cat._id}`}
                >
                  {cat.image?.url ? (
                    <img src={cat.image.url} alt={cat.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 0.75rem' }} />
                  ) : (
                    <div className="category-card__icon">
                      <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                    </div>
                  )}
                  <p className="category-card__name">{cat.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section" id="featured-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Featured Products</h2>
                <p className="section-subtitle">Hand-picked for you</p>
              </div>
              <Link to="/products?featured=true" className="btn btn-ghost btn-sm" id="all-featured-link">See All <ArrowRight size={14} /></Link>
            </div>
            <div className="grid-products">
              {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-secondary)' }} id="new-arrivals-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">New Arrivals</h2>
                <p className="section-subtitle">Fresh drops, just in</p>
              </div>
              <Link to="/products?sort=newest" className="btn btn-ghost btn-sm" id="all-new-link">See All <ArrowRight size={14} /></Link>
            </div>
            <div className="grid-products">
              {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="section" id="cta-section">
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(96,239,255,0.08) 100%)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Ready to start shopping?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Join thousands of happy customers today</p>
            <Link to="/products" className="btn btn-primary btn-lg" id="cta-shop-btn">
              Explore All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
