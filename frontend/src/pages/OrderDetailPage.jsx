import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, Clock, MapPin, CreditCard, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.order);
    } catch {
      toast.error('Order not found');
      navigate('/orders');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchOrder();
      setLoading(false);
    };
    init();
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return null;

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setCancelling(true);
      try {
        const { data } = await api.put(`/orders/${id}/cancel`);
        toast.success(data.message || 'Order cancelled successfully');
        await fetchOrder();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel order');
      } finally {
        setCancelling(false);
      }
    }
  };

  return (
    <div className="container animate-fadeIn" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <Link to="/orders" className="btn btn-ghost btn-sm flex-center gap-1" style={{ width: 'fit-content', marginBottom: '1.5rem' }}>
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ORDER NUMBER</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>{order.orderNumber}</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={fetchOrder} className="btn btn-ghost btn-sm" title="Refresh order status">
            <RefreshCw size={14} />
          </button>
          {['pending', 'confirmed'].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="btn btn-outline btn-sm flex-center gap-1"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
              id="cancel-order-btn"
            >
              <XCircle size={14} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      <div className="checkout-layout">
        {/* Order Details: Items & Tracking */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Order Items */}
          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Order Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items.map((item) => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop'}
                    alt={item.name}
                    style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <Link to={`/products/${item.product}`} style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {item.name}
                    </Link>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Quantity: {item.quantity} × ₹{item.price.toLocaleString()}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipment Tracking Timeline */}
          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Shipment Tracking</h3>
              <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                {order.status.toUpperCase()}
              </span>
            </div>

            <div className="tracking-timeline">
              {order.tracking && order.tracking.length > 0 ? (
                order.tracking.map((track, i) => (
                  <div key={i} className="tracking-item" id={`tracking-step-${i}`}>
                    <p className="tracking-item__status">{track.status.toUpperCase()}</p>
                    {track.description && <p className="tracking-item__desc">{track.description}</p>}
                    {track.location && <p className="tracking-item__desc" style={{ color: 'var(--accent)' }}>Location: {track.location}</p>}
                    <p className="tracking-item__time">{new Date(track.timestamp).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <div className="tracking-item">
                  <p className="tracking-item__status">PENDING</p>
                  <p className="tracking-item__desc">Order has been placed.</p>
                  <p className="tracking-item__time">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shipping details, payment details, cost calculations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Cost summary card */}
          <div className="order-summary" style={{ position: 'static' }}>
            <h3 className="order-summary__title">Cost Breakdown</h3>
            <div className="order-summary__item">
              <span>Items Total</span>
              <span>₹{order.itemsPrice.toLocaleString()}</span>
            </div>
            <div className="order-summary__item">
              <span>Shipping Fee</span>
              <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
            </div>
            <div className="order-summary__item">
              <span>GST (18%)</span>
              <span>₹{order.taxPrice.toLocaleString()}</span>
            </div>
            <div className="order-summary__total">
              <span>Grand Total</span>
              <span className="order-summary__total-value">₹{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping Address info card */}
          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={16} /> Shipping Address
            </h3>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.shippingAddress.name}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.5' }}>
              {order.shippingAddress.line1}, {order.shippingAddress.line2 && `${order.shippingAddress.line2}, `}
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          {/* Payment Method / Status */}
          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={16} /> Payment Information
            </h3>
            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Method: <span style={{ textTransform: 'uppercase' }}>{order.paymentInfo.method}</span>
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Status: <span style={{ textTransform: 'capitalize', fontWeight: 600 }} className={`order-status-${order.paymentInfo.status}`}>
                {order.paymentInfo.status}
              </span>
            </p>
            {order.paymentInfo.paidAt && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Paid at: {new Date(order.paymentInfo.paidAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
