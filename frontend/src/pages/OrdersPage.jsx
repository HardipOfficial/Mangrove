import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import Pagination from '../components/ui/Pagination';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders?page=${page}&limit=10`);
        setOrders(data.orders);
        setPages(data.pagination.pages);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  if (loading) return <Loader />;

  return (
    <div className="container animate-fadeIn" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex-center" style={{ minHeight: '50vh' }}>
          <div className="empty-state card-glass" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="empty-state__icon">📦</div>
            <h2 className="empty-state__title">No Orders Found</h2>
            <p className="empty-state__desc" style={{ marginBottom: '1.5rem' }}>
              You haven't placed any orders yet. Check out our products to get started!
            </p>
            <button onClick={() => navigate('/products')} className="btn btn-primary">
              Shop Now
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div
              key={order._id}
              className="card-glass animate-fadeIn"
              style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}
            >
              <div
                className="flex-between"
                style={{
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '1rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDER NUMBER</span>
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent)' }}>{order.orderNumber}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PLACED ON</span>
                  <p style={{ fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL</span>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>₹{order.totalPrice.toLocaleString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>STATUS</span>
                  <p style={{ fontWeight: 600 }} className={`order-status-${order.status}`}>
                    {order.status.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Order item preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {order.items.slice(0, 2).map((item) => (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=60&h=60&fit=crop'}
                      alt={item.name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
                    + {order.items.length - 2} more items
                  </p>
                )}
              </div>

              <div className="flex-between">
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="btn btn-outline btn-sm"
                  id={`view-order-btn-${order._id}`}
                >
                  View Details & Track
                </button>
                {['pending', 'confirmed'].includes(order.status) && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Can be cancelled before dispatch
                  </p>
                )}
              </div>
            </div>
          ))}
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
