import { useState, useEffect } from 'react';
import { Eye, Edit2 } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Modal view/update state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');
  const [updateLocation, setUpdateLocation] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get(`/orders/admin/all?page=${page}&limit=15`);
      setOrders(data.orders);
      setPages(data.pagination.pages);
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    init();
  }, [page]);

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setUpdateDesc('');
    setUpdateLocation('');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/${selectedOrder._id}/status`, {
        status: updateStatus,
        description: updateDesc,
        location: updateLocation,
      });
      toast.success('Order status updated');
      setModalOpen(false);
      await fetchOrders();
    } catch (err) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn" id="admin-orders-page">
      <h1 className="admin-page-title">Manage Orders</h1>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{order.orderNumber}</td>
                  <td>{order.user?.name || 'Deleted User'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>₹{order.totalPrice.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${order.paymentInfo.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                      {order.paymentInfo.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openOrderModal(order)}
                      className="qty-btn"
                      style={{ color: 'var(--info)', borderColor: 'rgba(59, 130, 246, 0.2)' }}
                      title="View & Edit Status"
                      id={`view-order-btn-${order._id}`}
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onPageChange={setPage} />

      {/* Order Status Dialog Modal */}
      {selectedOrder && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Order ${selectedOrder.orderNumber}`} maxWidth="600px">
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customer details</p>
                <p style={{ fontWeight: 600, marginTop: '0.2rem' }}>{selectedOrder.user?.name || 'Guest'}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedOrder.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Shipping details</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
              </div>
            </div>

            <div className="divider" style={{ margin: '1rem 0' }} />

            <form onSubmit={handleUpdateStatus} id="order-status-form">
              <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Update Order Tracking Status</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="order-status-select">Status</label>
                  <select
                    id="order-status-select"
                    className="form-select"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="order-location">Current Location</label>
                  <input
                    type="text"
                    id="order-location"
                    className="form-input"
                    placeholder="e.g. Warehouse, Transit Hub"
                    value={updateLocation}
                    onChange={(e) => setUpdateLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="order-status-desc">Description</label>
                <input
                  type="text"
                  id="order-status-desc"
                  className="form-input"
                  placeholder="e.g. Package dispatched from city hub"
                  value={updateDesc}
                  onChange={(e) => setUpdateDesc(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={updating} id="save-status-btn">
                {updating ? 'Updating Status...' : 'Save Tracking Update'}
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
