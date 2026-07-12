import { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Edit User modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get(`/users?page=${page}&limit=15`);
      setUsers(data.users);
      setPages(data.pagination.pages);
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    init();
  }, [page]);

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/users/${selectedUser._id}`, formData);
      toast.success('User updated successfully');
      setModalOpen(false);
      await fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${userId}`);
        toast.success('User deleted');
        await fetchUsers();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-fadeIn" id="admin-users-page">
      <h1 className="admin-page-title">Manage Customers & Users</h1>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-success' : 'badge-default'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {user.isActive ? 'Active' : 'Banned'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => openEditModal(user)}
                      className="qty-btn"
                      style={{ color: 'var(--accent)', borderColor: 'rgba(34, 197, 94, 0.2)' }}
                      title="Edit User"
                      id={`edit-user-btn-${user._id}`}
                    >
                      <Edit2 size={14} />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="qty-btn"
                        style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        title="Delete User"
                        id={`delete-user-btn-${user._id}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pages={pages} onPageChange={setPage} />

      {/* Edit User Modal Dialog */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit User Account">
        <form onSubmit={handleUpdateUser} id="edit-user-form">
          <div className="form-group">
            <label className="form-label" htmlFor="user-name">Full Name</label>
            <input
              type="text"
              id="user-name"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="user-email">Email Address</label>
            <input
              type="email"
              id="user-email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="user-role">Role</label>
              <select
                id="user-role"
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="user">User / Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <label className="form-group flex" style={{ gap: '0.5rem', cursor: 'pointer', marginTop: '1.25rem' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '0.9rem' }}>Account Active</span>
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={saving} id="save-user-btn">
            {saving ? 'Saving...' : 'Update Account'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
