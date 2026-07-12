import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Address creation form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home',
  });

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data.addresses);
      const defaultAddr = data.addresses.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      else if (data.addresses.length > 0) setSelectedAddressId(data.addresses[0]._id);
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchAddresses();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <Loader />;

  const items = cart.items || [];
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shippingPrice = totalPrice >= 500 ? 0 : 50;
  const taxPrice = Math.round(totalPrice * 0.18);
  const grandTotal = totalPrice + shippingPrice + taxPrice;

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/addresses', newAddress);
      toast.success('Address added successfully');
      setNewAddress({
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        type: 'home',
      });
      setShowAddressForm(false);
      await fetchAddresses();
      setSelectedAddressId(data.address._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  // Razorpay integration loading helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }
    const address = addresses.find((a) => a._id === selectedAddressId);
    if (!address) return;

    setPlacingOrder(true);
    try {
      // 1. Create order on backend (configured for COD or Razorpay payment pending status)
      const orderPayload = {
        shippingAddress: {
          name: address.name,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        paymentMethod,
        notes,
      };

      const { data } = await api.post('/orders', orderPayload);
      const placedOrder = data.order;

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully');
        await clearCart();
        navigate(`/orders/${placedOrder._id}`);
      } else {
        // Razorpay payment
        const resScript = await loadRazorpayScript();
        if (!resScript) {
          toast.error('Failed to load Razorpay. Placed order with Cash on Delivery.');
          navigate(`/orders/${placedOrder._id}`);
          return;
        }

        // Create transaction order inside Razorpay API on backend
        const orderInfo = await api.post('/payment/create-order', {
          amount: grandTotal,
          orderId: placedOrder._id,
        });

        const options = {
          key: orderInfo.data.key,
          amount: orderInfo.data.order.amount,
          currency: orderInfo.data.order.currency,
          name: 'Mangrove Store',
          description: 'E-commerce Purchase',
          order_id: orderInfo.data.order.id,
          handler: async function (response) {
            try {
              // Verify transaction signature on backend
              await api.post('/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: placedOrder._id,
              });
              toast.success('Payment verified successfully!');
              await clearCart();
              navigate(`/orders/${placedOrder._id}`);
            } catch (err) {
              toast.error('Payment verification failed. Your order status is pending.');
              navigate('/orders');
            }
          },
          prefill: {
            name: address.name,
            contact: address.phone,
          },
          theme: {
            color: '#22c55e',
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="container animate-fadeIn" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>

      <div className="checkout-layout">
        {/* Shipping address & payment options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Shipping Addresses Section */}
          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Select Shipping Address</h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="btn btn-outline btn-sm"
                id="toggle-address-form"
              >
                {showAddressForm ? 'Cancel' : 'Add New Address'}
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddressSubmit} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="addr-name">Full Name</label>
                    <input
                      type="text"
                      id="addr-name"
                      className="form-input"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="addr-phone">Phone Number</label>
                    <input
                      type="text"
                      id="addr-phone"
                      className="form-input"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="addr-line1">Address Line 1</label>
                  <input
                    type="text"
                    id="addr-line1"
                    className="form-input"
                    value={newAddress.line1}
                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="addr-line2">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    id="addr-line2"
                    className="form-input"
                    value={newAddress.line2}
                    onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="addr-city">City</label>
                    <input
                      type="text"
                      id="addr-city"
                      className="form-input"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="addr-state">State</label>
                    <input
                      type="text"
                      id="addr-state"
                      className="form-input"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="addr-pincode">Pincode</label>
                    <input
                      type="text"
                      id="addr-pincode"
                      className="form-input"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm" id="save-address-btn">
                  Save Address
                </button>
              </form>
            )}

            {addresses.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                No addresses found. Add an address to place your order.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className="card-glass flex"
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                      border: selectedAddressId === addr._id ? '2px solid var(--accent)' : '1px solid var(--border)',
                      gap: '1rem',
                      alignItems: 'flex-start',
                    }}
                    id={`address-label-${addr._id}`}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      value={addr._id}
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      style={{ marginTop: '0.2rem', accentColor: 'var(--accent)' }}
                    />
                    <div>
                      <p style={{ fontWeight: 600 }}>
                        {addr.name} <span className="badge badge-default" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{addr.type}</span>
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {addr.line1}, {addr.line2 && `${addr.line2}, `}
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Select Payment Method</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label
                className="card-glass flex"
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  border: paymentMethod === 'cod' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  gap: '1rem',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div>
                  <p style={{ fontWeight: 600 }}>Cash on Delivery (COD)</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pay cash when your order gets delivered.</p>
                </div>
              </label>

              <label
                className="card-glass flex"
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  border: paymentMethod === 'razorpay' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  gap: '1rem',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div>
                  <p style={{ fontWeight: 600 }}>Online Payment (UPI, Cards, Netbanking)</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pay securely via Razorpay payment gateway.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Order Notes */}
          <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <label className="form-label" htmlFor="order-notes" style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>Order Notes (Optional)</label>
            <textarea
              id="order-notes"
              className="form-textarea"
              placeholder="Instructions for delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Cost Summary & Place Order */}
        <div className="order-summary">
          <h3 className="order-summary__title">Checkout Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', maxHeight: '180px', overflowY: 'auto' }}>
            {items.map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {item.quantity}x {item.product?.name}
                </span>
                <span>₹{((item.discountPrice || item.price) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="divider" style={{ margin: '0.5rem 0' }} />

          <div className="order-summary__item">
            <span>Subtotal</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
          <div className="order-summary__item">
            <span>Shipping</span>
            <span>{totalPrice >= 500 ? 'FREE' : '₹50'}</span>
          </div>
          <div className="order-summary__item">
            <span>Estimated Tax (18% GST)</span>
            <span>₹{taxPrice.toLocaleString()}</span>
          </div>
          <div className="order-summary__total">
            <span>Grand Total</span>
            <span className="order-summary__total-value">₹{grandTotal.toLocaleString()}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="btn btn-primary btn-full flex-center"
            style={{ marginTop: '1.5rem' }}
            disabled={placingOrder || addresses.length === 0}
            id="place-order-btn"
          >
            {placingOrder ? 'Placing Order...' : paymentMethod === 'cod' ? 'Place COD Order' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
