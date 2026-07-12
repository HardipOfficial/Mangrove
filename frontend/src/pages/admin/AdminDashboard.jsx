import { useState, useEffect } from 'react';
import { Users, ShoppingBag, ClipboardList, IndianRupee, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/ui/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
        setLowStockProducts(data.lowStockProducts);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn">
      <h1 className="admin-page-title">Dashboard Overview</h1>

      {/* Stats Cards grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--accent)' }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="stat-card__value">₹{stats?.totalRevenue?.toLocaleString() || 0}</p>
            <p className="stat-card__label">Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="stat-card__value">{stats?.totalOrders || 0}</p>
            <p className="stat-card__label">Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="stat-card__value">{stats?.totalProducts || 0}</p>
            <p className="stat-card__label">Active Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Users size={22} />
          </div>
          <div>
            <p className="stat-card__value">{stats?.totalUsers || 0}</p>
            <p className="stat-card__label">Registered Customers</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Recent Orders Table */}
        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">Recent Orders</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{order.orderNumber}</td>
                      <td>{order.user?.name || 'Guest'}</td>
                      <td>₹{order.totalPrice.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ color: 'var(--warning)' }} /> Inventory Stock Alerts
          </h3>
          {lowStockProducts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              All products have healthy stock levels!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lowStockProducts.map((prod) => (
                <div
                  key={prod._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=40&h=40&fit=crop'}
                      alt=""
                      style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                      {prod.name}
                    </span>
                  </div>
                  <span className={`badge ${prod.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                    {prod.stock === 0 ? 'Out of stock' : `${prod.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
