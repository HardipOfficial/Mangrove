import { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Add/Edit Address Form state
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data.addresses);
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

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      type: 'home',
      isDefault: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingId(addr._id);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      type: addr.type,
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, formData);
        toast.success('Address updated');
      } else {
        await api.post('/addresses', formData);
        toast.success('Address added');
      }
      setModalOpen(false);
      await fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Delete this address?')) {
      try {
        await api.delete(`/addresses/${addressId}`);
        toast.success('Address deleted');
        await fetchAddresses();
      } catch (err) {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await api.put(`/addresses/${addressId}/default`);
      toast.success('Default address updated');
      await fetchAddresses();
    } catch {}
  };

  if (loading) return <Loader />;

  return (
    <div className="container animate-fadeIn" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>My Addresses</h1>
        <button onClick={openAddModal} className="btn btn-primary flex-center gap-1" id="add-addr-btn">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="empty-state card-glass">
          <div className="empty-state__icon">📍</div>
          <h2 className="empty-state__title">No Saved Addresses</h2>
          <p className="empty-state__desc" style={{ marginBottom: '1.5rem' }}>
            Add your shipping details here to save time during checkout.
          </p>
          <button onClick={openAddModal} className="btn btn-primary btn-sm">Add Address</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="card-glass animate-fadeIn"
              style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: addr.isDefault ? '2px solid var(--accent)' : '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
              id={`address-card-${addr._id}`}
            >
              <div>
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <span className="badge badge-default" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {addr.type}
                  </span>
                  {addr.isDefault && <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>DEFAULT</span>}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{addr.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {addr.line1}, {addr.line2 && `${addr.line2}, `}
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Phone: {addr.phone}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                <button onClick={() => openEditModal(addr)} className="btn btn-ghost btn-sm" style={{ flex: 1 }} id={`edit-addr-${addr._id}`}>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  disabled={addr.isDefault}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  title="Delete Address"
                  id={`delete-addr-${addr._id}`}
                >
                  <Trash2 size={14} />
                </button>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr._id)} className="btn btn-outline btn-sm" style={{ flex: 1 }} id={`set-default-${addr._id}`}>
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Address' : 'Add Address'}>
        <form onSubmit={handleSubmit} id="address-dialog-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="dialog-name">Name</label>
              <input
                type="text"
                id="dialog-name"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="dialog-phone">Phone</label>
              <input
                type="text"
                id="dialog-phone"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="dialog-line1">Line 1</label>
            <input
              type="text"
              id="dialog-line1"
              className="form-input"
              value={formData.line1}
              onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="dialog-line2">Line 2</label>
            <input
              type="text"
              id="dialog-line2"
              className="form-input"
              value={formData.line2}
              onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="dialog-city">City</label>
              <input
                type="text"
                id="dialog-city"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="dialog-state">State</label>
              <input
                type="text"
                id="dialog-state"
                className="form-input"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="dialog-pincode">Pincode</label>
              <input
                type="text"
                id="dialog-pincode"
                className="form-input"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="dialog-type">Type</label>
              <select
                id="dialog-type"
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
            <label className="form-group flex" style={{ gap: '0.5rem', cursor: 'pointer', marginTop: '1.25rem' }}>
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '0.9rem' }}>Set Default Address</span>
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} id="dialog-submit-btn">
            {editingId ? 'Update Address' : 'Add Address'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
