import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ui/ProductCard';
import Pagination from '../components/ui/Pagination';
import Loader from '../components/ui/Loader';
import { SlidersHorizontal } from 'lucide-react';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  // Filters from URL params
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page')) || 1;
  const featured = searchParams.get('featured') || '';

  // Local state for sidebar filter inputs
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories?active=true'),
          api.get('/products/brands'),
        ]);
        setCategories(catRes.data.categories);
        setBrands(brandRes.data.brands);
      } catch {}
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(searchParams).toString();
        const { data } = await api.get(`/products?${query}`);
        setProducts(data.products);
        setPagination({
          page: data.pagination.page,
          pages: data.pagination.pages,
        });
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.set('page', '1'); // Reset to page 1 on filter update
    setSearchParams(nextParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (localMinPrice) nextParams.set('minPrice', localMinPrice);
    else nextParams.delete('minPrice');
    if (localMaxPrice) nextParams.set('maxPrice', localMaxPrice);
    else nextParams.delete('maxPrice');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setLocalMinPrice('');
    setLocalMaxPrice('');
  };

  return (
    <div className="container animate-fadeIn" style={{ paddingBottom: '3rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-header__title">
            {keyword ? `Search Results for "${keyword}"` : 'All Products'}
          </h1>
          <p className="page-header__subtitle">
            Explore our collection of handpicked premium items.
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm flex-center gap-1"
          style={{ display: 'none' /* Will show on mobile later if desired */ }}
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', marginTop: '1rem' }} className="products-layout-grid">
        {/* Sidebar Filters */}
        <aside className="filter-sidebar">
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h3 className="filter-sidebar__title">Filters</h3>
            <button
              onClick={clearAllFilters}
              style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}
            >
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h4 className="filter-section__title">Category</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <button
                className={`filter-option ${!category ? 'active' : ''}`}
                onClick={() => updateParam('category', '')}
                style={{
                  textAlign: 'left',
                  width: '100%',
                  color: !category ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: !category ? '600' : 'normal',
                }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`filter-option ${category === cat._id ? 'active' : ''}`}
                  onClick={() => updateParam('category', cat._id)}
                  style={{
                    textAlign: 'left',
                    width: '100%',
                    color: category === cat._id ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: category === cat._id ? '600' : 'normal',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="filter-section">
            <h4 className="filter-section__title">Brand</h4>
            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
              <button
                className={`filter-option ${!brand ? 'active' : ''}`}
                onClick={() => updateParam('brand', '')}
                style={{
                  textAlign: 'left',
                  width: '100%',
                  color: !brand ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: !brand ? '600' : 'normal',
                }}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  className={`filter-option ${brand === b ? 'active' : ''}`}
                  onClick={() => updateParam('brand', b)}
                  style={{
                    textAlign: 'left',
                    width: '100%',
                    color: brand === b ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: brand === b ? '600' : 'normal',
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h4 className="filter-section__title">Price Range (₹)</h4>
            <form onSubmit={handlePriceApply} className="price-range">
              <input
                type="number"
                placeholder="Min"
                className="price-input"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                className="price-input"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Go
              </button>
            </form>
          </div>

          {/* Ratings */}
          <div className="filter-section">
            <h4 className="filter-section__title">Minimum Rating</h4>
            {[4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                className="filter-option"
                onClick={() => updateParam('minRating', stars.toString())}
                style={{
                  textAlign: 'left',
                  width: '100%',
                  color: Number(minRating) === stars ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: Number(minRating) === stars ? '600' : 'normal',
                }}
              >
                ★ {stars} & Up
              </button>
            ))}
          </div>
        </aside>

        {/* Product Grid and Sorting */}
        <div>
          <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Showing {products.length} products
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort By:</span>
              <select
                className="form-select"
                style={{ padding: '0.4rem 2rem 0.4rem 1rem', width: 'auto', fontSize: '0.85rem' }}
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
              >
                <option value="">Featured</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Reviews</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <div className="empty-state card-glass">
              <p className="empty-state__icon">🔍</p>
              <h3 className="empty-state__title">No Products Found</h3>
              <p className="empty-state__desc">Try adjusting your filters or search keywords.</p>
              <button onClick={clearAllFilters} className="btn btn-primary btn-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid-products">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                onPageChange={(p) => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set('page', p.toString());
                  setSearchParams(nextParams);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
